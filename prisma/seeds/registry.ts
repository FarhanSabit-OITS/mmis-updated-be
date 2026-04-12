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
        profile: {
          create: {
            firstName: market.name,
            lastName: "Authority",
            primaryPhone: "None",
            country: "Uganda",
            primaryEmail: `authority.${market.uniqueCode.toLowerCase()}@marketmaster.ug`,
            mmisId: `MMIS-U-AUTH-${market.uniqueCode}`,
            personalQRCode: `MMIS-U-AUTH-${market.uniqueCode}`
          }
        }
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
          const rawRent = Number(String(row['mth_pay'] || row['amount'] || 0).replace(/[^\d.]/g, '')) || 0;
          
          if (name === 'Unknown' || name.length < 2) continue;

          // Deduplication check
          const dummyPhones = ['000000000', '123456789', '999999999', '0700000000', '0770000000'];
          const phoneKey = (phone.length >= 9 && !dummyPhones.includes(phone.slice(-9))) ? phone.slice(-9) : null;
          const dedupeKey = nin || phoneKey;
          let vendorId = (nin ? vendorsByNin.get(nin) : null) || (phoneKey ? vendorsByPhone.get(phoneKey) : null);

          // If not in local map, check database (Staff/Admins might exist)
          if (!vendorId) {
            const dbUser = await prisma.user.findFirst({
              where: {
                OR: [
                  nin ? { profile: { nationalId: nin } } : null,
                  phoneKey ? { phone: { endsWith: phoneKey } } : null
                ].filter(Boolean) as any
              },
              include: { stakeholder: { include: { vendor: true } } }
            });

            let user;
            if (dbUser) {
              user = dbUser;
              console.log(`    ♻️  Found existing user: ${user.email} for ${name}`);
            } else {
              // Create User
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

              user = await prisma.user.create({
                data: {
                  email: safeEmail,
                  passwordHash: hashedPassword,
                  phone: phoneKey ? `+256${phoneKey}` : null,
                  status: process.env.NODE_ENV === 'production' ? 'PENDING' : 'ACTIVE',
                  emailVerified: true,
                  profile: {
                    create: {
                      firstName: name.split(' ')[0].slice(0, 50),
                      lastName: (name.split(' ').slice(1).join(' ') || 'Vendor').slice(0, 50),
                      nationalId: nin || undefined,
                      nationalIdType: nin ? "NIN" : undefined,
                      primaryPhone: phoneKey ? `+256${phoneKey}` : "None",
                      primaryEmail: safeEmail,
                      country: "Uganda",
                      mmisId: `MMIS-U-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
                      personalQRCode: `MMIS-U-${crypto.randomBytes(3).toString('hex').toUpperCase()}`
                    }
                  }
                }
              });
            }

            // Ensure Stakeholder + Vendor exist for this user
            const stHolder = await prisma.stakeholder.upsert({
              where: { userId: user.id },
              update: {},
              create: { 
                userId: user.id, 
                stakeholderType: 'VENDOR', 
                kycStatus: 'VERIFIED' 
              }
            });

            const vendor = await prisma.vendor.upsert({
              where: { stakeholderId: stHolder.id },
              update: {
                 primaryMarketId: market.id,
                 businessName: `${name}'s Business`,
                 businessType: category,
              },
              create: {
                stakeholderId: stHolder.id,
                vendorCode: `V-${market.uniqueCode}-${crypto.randomBytes(6).toString('hex').toUpperCase()}`,
                businessName: `${name}'s Business`,
                businessType: category,
                primaryMarketId: market.id,
              }
            });
            
            vendorId = vendor.id;
            if (nin) vendorsByNin.set(nin, vendorId);
            if (phoneKey) vendorsByPhone.set(phoneKey, vendorId);
          }

          // Create/Find Section
          const sectionKey = category.toUpperCase().replace(/\W/g, "");
          const sectionCode = `${market.uniqueCode}-${sectionKey}`.slice(0, 50);
          
          const section = await prisma.marketSection.upsert({
            where: { uniqueCode: sectionCode },
            update: {
              name: category, // Keep name updated if it matches code
            },
            create: {
              marketId: market.id,
              levelId: level.id,
              uniqueCode: sectionCode,
              name: category,
              sectionType: "COMMERCIAL",
              createdById: adminId,
            }
          });

          // Create Facility
          const facilityCode = `FAC-${market.uniqueCode}-${unitNo.replace(/\W/g, "-")}`.slice(0, 50);
          const facility = await prisma.facility.upsert({
            where: { uniqueCode: facilityCode },
            update: {
              vendors: { connect: { id: vendorId } }
            },
            create: {
              marketId: market.id,
              levelId: level.id,
              sectionId: section.id,
              memberId: authorityMember.id,
              unitNumber: unitNo,
              uniqueCode: facilityCode,
              type: unitNo.toLowerCase().includes("lck") ? 'SHOP' : 'STALL',
              monthlyRent: new Prisma.Decimal(rawRent),
              dailyRate: new Prisma.Decimal(Math.round(rawRent / 30)),
              status: 'ACTIVE',
              occupationStatus: 'OCCUPIED',
              createdById: adminId,
              vendors: { connect: { id: vendorId } }
            }
          });

          // Create Rent Contract (Robust Existence Check)
          const contractNo = `CTR-${market.uniqueCode}-${unitNo.replace(/\W/g, "-")}`.slice(0, 50);
          const existingContract = await prisma.rentContract.findUnique({
              where: { contractNumber: contractNo }
          });

          if (!existingContract) {
            await prisma.rentContract.create({
              data: {
                facilityId: facility.id,
                landlordId: authorityMember.id,
                tenantId: vendorId,
                contractNumber: contractNo,
                startDate,
                endDate,
                durationMonths: 12,
                monthlyRent: new Prisma.Decimal(rawRent),
                createdById: adminId,
                status: "ACTIVE",
              }
            });
          }

        } catch (err: any) {
          // Log missed row but continue loop
          console.warn(`  ⚠️  Skipped row for "${row['name'] || 'Unknown'}" in [${sheetName}]: ${err.message}`);
        }
      }
    }
  }

  console.log("✅ Registry ingestion complete.");
}
