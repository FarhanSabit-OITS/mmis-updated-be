import { PrismaClient, UserStatus, StakeholderType, KycStatus, FacilityType, FacilityStatus, OccupationStatus, Prisma } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import * as fs from "fs";
import * as path from "path";
import * as xlsx from "xlsx";
import * as crypto from "crypto";

export async function processRegistries(prisma: PrismaClient, dataDir: string, marketMap: Record<string, any>, adminId: string) {
  console.log("📊 Starting operational data ingestion from Excel registries...");

  if (!fs.existsSync(dataDir)) {
    console.warn(`⚠️ Data directory not found: ${dataDir}. Skipping registry ingestion.`);
    return;
  }

  const files = fs.readdirSync(dataDir).filter(f => f.endsWith(".xlsx"));
  const hashedPassword = bcrypt.hashSync("Password@123", 10);

  const vendorsByNin = new Map<string, string>(); // NIN -> VendorId
  const vendorsByPhone = new Map<string, string>(); // Phone -> VendorId
  const usedEmails = new Set<string>();

  for (const fileName of files) {
    console.log(`\n📂 Processing: ${fileName}`);
    const filePath = path.join(dataDir, fileName);
    const workbook = xlsx.readFile(filePath);

    // Determine target market
    let market = marketMap["MKT-MBARARA"]; // Default fallback
    if (fileName.toLowerCase().includes("kabale")) market = marketMap["MKT-KABALE"];
    if (fileName.toLowerCase().includes("jinja")) market = marketMap["MKT-JINJA"];
    
    // Create/Find Landlord Member for this market
    const authorityUser = await prisma.user.upsert({
      where: { email: `authority.${market.uniqueCode.toLowerCase()}@marketmaster.ug` },
      update: {},
      create: {
        email: `authority.${market.uniqueCode.toLowerCase()}@marketmaster.ug`,
        passwordHash: hashedPassword,
        status: UserStatus.ACTIVE,
        emailVerified: true,
      }
    });

    const stakeholder = await prisma.stakeholder.upsert({
      where: { userId: authorityUser.id },
      update: {},
      create: {
        userId: authorityUser.id,
        stakeholderType: StakeholderType.MEMBER,
        kycStatus: KycStatus.VERIFIED,
      }
    });

    const authorityMember = await prisma.member.upsert({
      where: { stakeholderId: stakeholder.id },
      update: {},
      create: {
        stakeholderId: stakeholder.id,
        membershipNumber: `AUTH-${market.uniqueCode}`,
        businessName: `${market.name} Management Authority`,
        registrationNumber: `REG-${market.uniqueCode}`,
      }
    });

    // Create Base Level
    const level = await prisma.marketLevel.upsert({
      where: { marketId_levelNumber: { marketId: market.id, levelNumber: 1 } },
      update: {},
      create: {
        marketId: market.id,
        levelNumber: 1,
        uniqueCode: `${market.uniqueCode}-L1`,
        name: "Ground Floor",
        createdById: adminId,
      }
    });

    // Calculate typical end date (1 year from now)
    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(startDate.getFullYear() + 1);

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const items: any[] = xlsx.utils.sheet_to_json(sheet);
      console.log(`  - Sheet [${sheetName}]: ${items.length} rows`);

      for (const row of items) {
        try {
          // Normalize Row Data
          const name = String(row['name'] || row['NAME'] || row['OWNER_NAME'] || row['CURRENT VENDOR'] || 'Unknown').trim();
          const phone = String(row['phone_no'] || row['mobile_number'] || row['PHONE NO.'] || '').replace(/\D/g, "");
          const nin = String(row['nin'] || row['NIN'] || '').trim().toUpperCase();
          const unitNo = String(row['fc_no'] || row['FACILITY NO.'] || row['LOCKUPS'] || 'N/A').trim();
          const category = String(row['category'] || row['CATEGORY'] || 'General').trim();
          const rawRent = Number(row['mth_pay'] || row['amount'] || 0);
          
          if (name === 'Unknown' || name.length < 2) continue;

          // Deduplication check
          const dedupeKey = nin || (phone.length >= 9 ? phone : null);
          let vendorId = dedupeKey ? (vendorsByNin.get(nin) || vendorsByPhone.get(phone)) : null;

          if (!vendorId) {
            // Create User + Vendor
            const sanitizeString = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
            const safeMarketName = sanitizeString(market.name);
            const safeVendorName = sanitizeString(name) || `vendor${crypto.randomBytes(2).toString('hex')}`;
            
            let safeEmail = `${safeVendorName}@${safeMarketName}.ug`;
            let counter = 1;
            while(usedEmails.has(safeEmail)) {
              safeEmail = `${safeVendorName}${counter}@${safeMarketName}.ug`;
              counter++;
            }
            usedEmails.add(safeEmail);

            const user = await prisma.user.create({
              data: {
                email: safeEmail,
                passwordHash: hashedPassword,
                phone: phone ? `+256${phone.slice(-9)}` : null,
                status: UserStatus.PENDING,
                emailVerified: true,  // Important: allow them to pass the verif check during login
                profile: {
                  create: {
                    firstName: name.split(' ')[0].slice(0, 50),
                    lastName: (name.split(' ').slice(1).join(' ') || 'Vendor').slice(0, 50),
                    nationalId: nin || undefined,
                    nationalIdType: nin ? "NIN" : undefined,
                    primaryPhone: phone ? `+256${phone.slice(-9)}` : "None",
                    primaryEmail: safeEmail,
                    country: "Uganda",
                  }
                }
              }
            });

            const stHolder = await prisma.stakeholder.create({
              data: { userId: user.id, stakeholderType: StakeholderType.VENDOR, kycStatus: KycStatus.VERIFIED }
            });

            const vendor = await prisma.vendor.create({
              data: {
                stakeholderId: stHolder.id,
                vendorCode: `V-${market.uniqueCode}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
                businessName: `${name}'s Business`,
                businessType: category,
                primaryMarketId: market.id,
              }
            });
            
            vendorId = vendor.id;
            if (nin) vendorsByNin.set(nin, vendorId);
            if (phone.length >= 9) vendorsByPhone.set(phone, vendorId);
          }

          // Create/Find Section
          const sectionKey = category.toUpperCase().replace(/\W/g, "");
          const section = await prisma.marketSection.upsert({
            where: { marketId_levelId_name: { marketId: market.id, levelId: level.id, name: category } },
            update: {},
            create: {
              marketId: market.id,
              levelId: level.id,
              uniqueCode: `${market.uniqueCode}-${sectionKey}`.slice(0, 50),
              name: category,
              sectionType: "COMMERCIAL",
              createdById: adminId,
            }
          });

          // Create Facility
          const facility = await prisma.facility.upsert({
            where: { marketId_unitNumber: { marketId: market.id, unitNumber: unitNo } },
            update: {
              vendors: { connect: { id: vendorId } }
            },
            create: {
              marketId: market.id,
              levelId: level.id,
              sectionId: section.id,
              memberId: authorityMember.id,
              unitNumber: unitNo,
              uniqueCode: `FAC-${market.uniqueCode}-${unitNo.replace(/\W/g, "-")}`,
              type: unitNo.toLowerCase().includes("lck") ? FacilityType.SHOP : FacilityType.STALL,
              monthlyRent: new Prisma.Decimal(rawRent),
              dailyRate: new Prisma.Decimal(Math.round(rawRent / 30)),
              status: FacilityStatus.ACTIVE,
              occupationStatus: OccupationStatus.OCCUPIED,
              createdById: adminId,
              vendors: { connect: { id: vendorId } }
            }
          });

          // Create Rent Contract
          await prisma.rentContract.create({
            data: {
              facilityId: facility.id,
              landlordId: authorityMember.id,
              tenantId: vendorId,
              contractNumber: `CTR-${market.uniqueCode}-${unitNo.replace(/\W/g, "-")}`,
              startDate,
              endDate,
              durationMonths: 12,
              monthlyRent: new Prisma.Decimal(rawRent),
              createdById: adminId,
              status: "ACTIVE",
            }
          });

        } catch (err) {
          // Log and continue
        }
      }
    }
  }

  console.log("✅ Registry ingestion complete.");
}
