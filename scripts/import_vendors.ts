
import { PrismaClient, UserStatus, StakeholderType, KycStatus, FacilityType, FacilityStatus, OccupationStatus, Gender } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';
// @ts-ignore
import * as xlsx from 'xlsx';

const prisma = new PrismaClient();

const FILE_PATH = path.join(__dirname, '../Kabale Central Market FTS.xlsx');
const MARKET_NAME = "Kabale Central Market";
const CITY_NAME = "Kabale Municipality";
const DISTRICT_NAME = "Kabale";
const DEFAULT_PASSWORD = "Start@123";

// Excel Column Interface
interface ExcelRow {
    id: number;
    name: string;
    nin: string;
    phone_no: string;
    category: string;
    fc_no: string;
    mth_pay: number;
    market_id: number;
    create_by: string;
    create_date: string;
    update_by: string;
    update_date: string;
    is_active: string;
    sex: string;
    fc_type: string;
}

async function main() {
    console.log("🚀 Starting Import Process...");

    // 1. Ensure Market Exists
    console.log(`🔎 Checking Market: ${MARKET_NAME}...`);
    let market = await prisma.market.findFirst({ where: { name: MARKET_NAME } });

    if (!market) {
        console.log(`⚠️ Market not found. Creating...`);

        // Ensure District
        let district = await prisma.district.findFirst({ where: { name: DISTRICT_NAME } });
        if (!district) {
            // Create a dummy geolocation if needed, or assume one exists. For simplicity, we create one.
            const geo = await prisma.geolocation.create({
                data: {
                    name: "Uganda",
                    code: "UG" + Date.now().toString().slice(-4), // Randomize slightly
                }
            });
            district = await prisma.district.create({
                data: {
                    name: DISTRICT_NAME,
                    code: "DST-KAB",
                    geolocationId: geo.id
                }
            });
            console.log(`✅ Created District: ${district.name}`);
        }

        // Ensure City
        let city = await prisma.city.findFirst({ where: { name: CITY_NAME } });
        if (!city) {
            city = await prisma.city.create({
                data: {
                    name: CITY_NAME,
                    code: "CTY-KAB", // Unique code
                    districtId: district.id
                }
            });
            console.log(`✅ Created City: ${city.name}`);
        }

        // Create Market
        market = await prisma.market.create({
            data: {
                name: MARKET_NAME,
                uniqueCode: "KAB01",
                cityId: city.id,
                address: "Kabale Central Business District",
                marketType: "PERMANENT",
                status: "ACTIVE"
            }
        });
        console.log(`✅ Created Market: ${market.name} (${market.id})`);
    } else {
        console.log(`✅ Market found: ${market.name} (${market.id})`);
    }

    // 2. Read Excel
    if (!fs.existsSync(FILE_PATH)) {
        console.error(`❌ File not found: ${FILE_PATH}`);
        process.exit(1);
    }
    const workbook = xlsx.readFile(FILE_PATH);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data: ExcelRow[] = xlsx.utils.sheet_to_json(sheet);

    console.log(`📊 Found ${data.length} rows in Excel.`);

    // 3. Process Rows
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    let processedCount = 0;
    let errorCount = 0;

    for (const row of data) {
        try {
            // Trim and clean data
            const cleanName = (row.name || "Unknown Vendor").trim();
            const cleanNin = (row.nin || "").trim().toUpperCase();
            const cleanPhone = (row.phone_no || "").replace(/\D/g, ''); // Digits only
            const cleanFcNo = (row.fc_no || "N/A").trim();
            const monthlyRent = Number(row.mth_pay) || 0;

            if (!cleanNin && !cleanPhone) {
                console.log(`⚠️ Skipping row (ID: ${row.id}): Missing NIN and Phone.`);
                continue; // Can't identify user
            }

            // A. Create/Find User
            // Logic: Try to find by NIN (via Profile) or Phone (via User)
            // But checking NIN first is harder across two tables. Let's check Phone first.

            let user = await prisma.user.findFirst({
                where: {
                    OR: [
                        { phone: cleanPhone },
                        { profile: { nationalId: cleanNin } }
                    ]
                }
            });

            if (!user) {
                // Generate Email
                const nameParts = cleanName.split(' ');
                const firstName = nameParts[0].toLowerCase().replace(/[^a-z]/g, '');
                const lastName = (nameParts.length > 1 ? nameParts[1] : 'user').toLowerCase().replace(/[^a-z]/g, '');
                const email = `${firstName}.${lastName}.${cleanFcNo.toLowerCase()}@placeholder.com`;

                user = await prisma.user.create({
                    data: {
                        email: email, // Note: This might conflict if duplicates exist, might need random string
                        phone: cleanPhone || null,
                        passwordHash: hashedPassword,
                        status: UserStatus.ACTIVE,
                        emailVerified: true, // Auto-verify for imported users
                        createdAt: row.create_date ? new Date(row.create_date) : new Date(),
                    }
                });
                // Create Profile
                await prisma.userProfile.create({
                    data: {
                        userId: user.id,
                        firstName: nameParts[0],
                        lastName: nameParts.slice(1).join(' ') || "Vendor",
                        nationalId: cleanNin || undefined,
                        gender: row.sex === 'M' ? Gender.MALE : (row.sex === 'F' ? Gender.FEMALE : Gender.OTHER),
                        primaryPhone: cleanPhone,
                        primaryEmail: email,
                        country: "Uganda"
                    }
                });
            }

            // B. Create Vendor Profile (if not exists)
            let vendor = await prisma.vendor.findFirst({ where: { stakeholder: { userId: user.id } } });

            if (!vendor) {
                // Create Stakeholder first
                const stakeholder = await prisma.stakeholder.create({
                    data: {
                        userId: user.id,
                        stakeholderType: StakeholderType.VENDOR,
                        kycStatus: KycStatus.VERIFIED, // Assume verified for existing market vendors
                    }
                });

                vendor = await prisma.vendor.create({
                    data: {
                        stakeholderId: stakeholder.id,
                        vendorCode: `V-${cleanFcNo}`,
                        businessName: cleanName + "'s Business",
                        businessType: row.category,
                        primaryMarketId: market.id
                    }
                });
            }

            let facilityId: string | null = null;

            // C. Create Facility
            // Heuristic for FacilityType
            const isShop = (row.fc_type || "").toUpperCase().includes("LCK") || (row.fc_type || "").toUpperCase().includes("SHOP");
            const facilityType = isShop ? FacilityType.SHOP : FacilityType.STALL;

            // Check if facility exists
            let facility = await prisma.facility.findUnique({
                where: { uniqueCode: `FAC-${cleanFcNo}` }
            });

            if (!facility) {
                // Need a Member ID for Facility creation (Schema requires memberId)
                // Solution: Create a generic "Kabale Municipal Council" Member to own these facilities.

                let councilUser = await prisma.user.findFirst({ where: { email: "council@kabale.go.ug" } });
                if (!councilUser) {
                    councilUser = await prisma.user.create({
                        data: {
                            email: "council@kabale.go.ug",
                            passwordHash: hashedPassword,
                            status: UserStatus.ACTIVE
                        }
                    });
                    const sHolder = await prisma.stakeholder.create({
                        data: { userId: councilUser.id, stakeholderType: StakeholderType.MEMBER }
                    });
                    await prisma.member.create({
                        data: {
                            stakeholderId: sHolder.id,
                            membershipNumber: "KMC-001",
                            businessName: "Kabale Municipal Council",
                            registrationNumber: "KMC-REG-001"
                        }
                    });
                }
                const councilMember = await prisma.member.findFirstOrThrow({ where: { businessName: "Kabale Municipal Council" } });

                facility = await prisma.facility.create({
                    data: {
                        marketId: market.id,
                        memberId: councilMember.id, // Council owns the facility
                        unitNumber: cleanFcNo,
                        uniqueCode: `FAC-${cleanFcNo}`,
                        facilityName: `${isShop ? 'Shop' : 'Stall'} ${cleanFcNo}`,
                        type: facilityType,
                        monthlyRent: monthlyRent,
                        dailyRate: Math.round(monthlyRent / 26),
                        contractStartDate: new Date(),
                        contractEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                        status: FacilityStatus.ACTIVE,
                        occupationStatus: OccupationStatus.VACANT,
                        createdById: user.id
                    }
                });
            }
            facilityId = facility.id;

            // D. Rent Contract
            if (facilityId) {
                // Check if contract exists
                const activeContract = await prisma.rentContract.findFirst({
                    where: {
                        facilityId: facilityId,
                        tenantId: vendor.id,
                        status: "ACTIVE"
                    }
                });

                if (!activeContract) {
                    const councilMember = await prisma.member.findFirstOrThrow({ where: { businessName: "Kabale Municipal Council" } });

                    await prisma.rentContract.create({
                        data: {
                            facilityId: facilityId,
                            landlordId: councilMember.id,
                            tenantId: vendor.id,
                            contractNumber: `CTR-${cleanFcNo}-${Date.now()}`,
                            startDate: new Date(),
                            endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                            durationMonths: 12,
                            monthlyRent: monthlyRent,
                            createdById: user.id
                        }
                    });
                }
            }

            processedCount++;
            if (processedCount % 10 === 0) console.log(`Have processed ${processedCount} rows...`);

        } catch (e) {
            console.error(`❌ Error processing row ${row.id}:`, e);
            errorCount++;
        }
    }

    console.log(`✅ Import Finished. Processed: ${processedCount}. Errors: ${errorCount}.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
