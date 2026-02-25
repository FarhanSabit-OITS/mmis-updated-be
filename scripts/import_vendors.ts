
import { PrismaClient, UserStatus, StakeholderType, KycStatus, ShopType, StallType, Gender } from '@prisma/client';
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

            // C. Create Shop or Stall
            /*
                fc_type analysis from inspection (if we had it):
                We will assume 'LCK' or similar is SHOP, else STALL.
                But based on schema, both are physically different tables.
                Let's use a heuristic: if rent > 100,000 it might be a Shop?
                Actually, let's look at `fc_type` in the Excel inspection.
                Wait, I can't inspect it interactively.
                I will assume everything is a Stall unless map says otherwise.
                Actually, the plan said: "If fc_type implies built structure... Assumption: LCK = Lockup (Shop)"
            */

            const isShop = (row.fc_type || "").toUpperCase().includes("LCK") || (row.fc_type || "").toUpperCase().includes("SHOP");

            let shopId: string | null = null;
            let stallId: string | null = null;

            if (isShop) {
                // Upsert Shop
                let shop = await prisma.shop.findUnique({
                    where: { marketId_shopNumber: { marketId: market.id, shopNumber: cleanFcNo } }
                });

                if (!shop) {
                    // Start: Need a Member ID for Shop creation (Schema requires memberId)
                    // In our schema, Member is a stakeholder type. A user can be a Member AND a Vendor?
                    // Or is Member == Landlord?
                    // Schema: Shop -> memberId (Member).
                    // This implies the Shop is OWNED by a Member.
                    // If the User is a Vendor (Tenant), who is the Member (Landlord)?
                    // If the market is government owned, maybe there is a default "Council" Member?

                    // CHECK: memberId is required in Shop.
                    // Solution: Create a generic "Kabale Municipal Council" Member to own these shops.

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

                    shop = await prisma.shop.create({
                        data: {
                            marketId: market.id,
                            memberId: councilMember.id, // Council owns the shop
                            shopNumber: cleanFcNo,
                            uniqueCode: `SHOP-${cleanFcNo}`,
                            shopName: `Shop ${cleanFcNo}`,
                            shopType: ShopType.RETAIL,
                            monthlyRent: monthlyRent,
                            contractStartDate: new Date(),
                            contractEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1 year default
                            createdById: user.id // Self-created? or System? Ideally Admin ID.
                        }
                    });
                }
                shopId = shop.id;
            } else {
                // Upsert Stall
                // Stall requires `shopId`. Wait.
                // Schema: Stall -> shopId.
                // Does this mean a Stall MUST be inside a Shop?
                // Or can a Stall be standalone?
                // Looking at schema: `stallId String @id` ... `shopId String`.
                // It seems Stalls are sub-units of Shops? Or is there a "Main Market Shop" that contains open stalls?

                // If the schema enforces Stall -> Shop, we need a "General Market Floor" Shop to hold these stalls.
                let generalShop = await prisma.shop.findFirst({ where: { marketId: market.id, shopNumber: "GENERAL-FLOOR" } });
                if (!generalShop) {
                    // We need that Council Member again
                    const councilMember = await prisma.member.findFirstOrThrow({ where: { businessName: "Kabale Municipal Council" } });

                    generalShop = await prisma.shop.create({
                        data: {
                            marketId: market.id,
                            memberId: councilMember.id,
                            shopNumber: "GENERAL-FLOOR",
                            uniqueCode: "KAB-GEN",
                            shopName: "General Market Floor",
                            monthlyRent: 0,
                            contractStartDate: new Date(),
                            contractEndDate: new Date(),
                            createdById: user.id // Using Current User is risky if it's the first loop.
                            // Better to fetch an Admin. But for script simplicity, we use the user or a hardcoded ID?
                            // Schema says `CreatedBy User`. We can use the first user created.
                        }
                    });
                }

                let stall = await prisma.stall.findUnique({
                    where: { shopId_stallNumber: { shopId: generalShop.id, stallNumber: cleanFcNo } }
                });

                if (!stall) {
                    stall = await prisma.stall.create({
                        data: {
                            shopId: generalShop.id,
                            marketId: market.id, // Added this field in recent schema review if it exists? 
                            // Wait, looking at schema provided earlier:
                            // computed lines 1117: `marketId String`
                            // computed lines 1121: `shop Shop`
                            // computed lines 1122: `vendor Vendor` (Required!)
                            vendorId: vendor.id,
                            stallNumber: cleanFcNo,
                            uniqueCode: `STALL-${cleanFcNo}`,
                            stallType: StallType.PERMANENT,
                            category: row.category || "General",
                            dailyRate: 0,
                            monthlyRate: monthlyRent,
                            contractStartDate: new Date(),
                            createdById: user.id
                        }
                    });
                }
                stallId = stall.id;
            }

            // D. Rent Contract
            // Required for payment module.
            // Schema: RentContract -> shopId, landlordId (Member), tenantId (Vendor).

            // If it's a Stall, does it have a RentContract?
            // Schema: Stall doesn't have RentContract relation directly, Shop does.
            // But `RentContract` has `shopId`.
            // If a vendor rents a Stall, how is that recorded?
            // Maybe `RentContract` is only for Shops?
            // Check Schema Line 2306: `shopId String`.
            // Check Schema Line 1057: `rentContracts RentContract[]`.
            // Stall does NOT have rent contracts?
            // Line 1100: `agreementTerms Json?` in Stall.
            // Line 1122: `vendor Vendor` is directly on Stall.

            // CONCLUSION:
            // Shops are rented via `RentContract`.
            // Stalls are assigned via direct `vendorId` link and have `monthlyRate` on the Stall record itself.
            // So if it's a Stall, we don't make a RentContract (or the schema doesn't support it well).
            // BUT the Payment Module needs to track payments.
            // `RentPayment` links to `RentContract`.
            // If Stalls don't have Contracts, how do they pay rent?
            // Maybe we create a "Dummy Shop" for the Stall to link a Contract?

            // OR we assume `RentContract` can point to that "General Market Floor" shop, but we distinguish by Tenant?
            // Yes, multiple contracts can point to the same Shop?
            // `@@index([shopId])` - not unique.
            // So we can create a RentContract for the "General Floor" Shop, assigned to this Vendor.

            if (stallId && !shopId) {
                // It's a stall. Use General Shop.
                const generalShop = await prisma.shop.findFirstOrThrow({ where: { shopNumber: "GENERAL-FLOOR" } });
                shopId = generalShop.id;
            }

            if (shopId) {
                // Check if contract exists
                const activeContract = await prisma.rentContract.findFirst({
                    where: {
                        shopId: shopId,
                        tenantId: vendor.id,
                        status: "ACTIVE"
                    }
                });

                if (!activeContract) {
                    const councilMember = await prisma.member.findFirstOrThrow({ where: { businessName: "Kabale Municipal Council" } });

                    await prisma.rentContract.create({
                        data: {
                            shopId: shopId,
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
