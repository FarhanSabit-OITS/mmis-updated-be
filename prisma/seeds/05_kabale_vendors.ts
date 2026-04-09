import { PrismaClient, StakeholderType, KycStatus, UserStatus, MfaType } from "@prisma/client";
import { hash } from "bcryptjs";
import * as fs from 'fs';
import * as path from 'path';

function normalisePhone(raw: number | string | null, fallback: string): string {
  if (!raw) return fallback;
  const s = String(raw).replace(/\D/g, "");
  if (s.length >= 9) return `+${s}`;
  return fallback;
}

function toEmailLocal(name: string, id: number): string {
  return (
    (name || "vendor")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, ".")
      .replace(/\.+/g, ".")
      .replace(/^\.+|\.+$/g, "")
      .slice(0, 30) + `.${id}`
  );
}

export async function seedKabaleVendors(prisma: PrismaClient) {
  console.log('\n=======================================');
  console.log('🌱 Seeding Kabale Vendors / Members...');
  console.log('=======================================');

  const DEV_PASSWORD = await hash("Password@123", 10);

  const jsonPath = path.join(__dirname, '../data/kabale_shops.json');
  const rawData = fs.readFileSync(jsonPath, 'utf8');
  const FTS_ROWS = JSON.parse(rawData);

  console.log(`Loaded ${FTS_ROWS.length} records. Creating vendor users...`);
  const stakeholderMap: Record<number, string> = {};

  for (let i = 0; i < FTS_ROWS.length; i++) {
    const row = FTS_ROWS[i];
    const email = `member.${toEmailLocal(row.vendorName, row.id)}@kabalemarket.ug`;
    const phone = normalisePhone(row.phone, `+256701${String(i).padStart(6, "0")}`);
    
    const nameParts = (row.vendorName || "Vendor").split(/\s+/);
    const firstName = nameParts[0] || "Vendor";
    const lastName  = nameParts.slice(1).join(" ") || String(row.id);
    const pwHash = DEV_PASSWORD;

    try {
        const u = await prisma.user.upsert({
            where: { email },
            update: {},
            create: {
              email,
              passwordHash: pwHash,
              phone,
              emailVerified: true,
              status: UserStatus.ACTIVE,
              mfaType: MfaType.NONE,
              profile: {
                create: {
                  firstName: firstName.slice(0, 100),
                  lastName: lastName.slice(0, 100),
                  primaryPhone: phone,
                  primaryEmail: email,
                },
              },
              stakeholder: {
                create: {
                  stakeholderType: StakeholderType.MEMBER,
                  kycStatus: KycStatus.VERIFIED,
                  kycVerifiedAt: new Date(),
                  member: {
                      create: {
                          membershipNumber: `MEM-KBL-${String(row.id).padStart(5, "0")}`,
                          membershipType: "REGULAR",
                          businessName: (row.shopName || '').slice(0, 200),
                          businessType: row.category,
                          registrationNumber: `REG-KBL-${String(row.id).padStart(6, "0")}`,
                      }
                  }
                },
              },
            },
          });
      
          const sh = await prisma.stakeholder.findUniqueOrThrow({ where: { userId: u.id }, include: { member: true } });
          stakeholderMap[row.id] = sh.member!.id;

          if (i > 0 && i % 100 === 0) {
            console.log(`... seeded ${i} vendors.`);
          }
    } catch (e) {
        console.warn(`Error creating vendor ${row.id} (${row.vendorName}): ${(e as Error).message}`);
    }
  }

  console.log(`✅ Kabale Vendors Created!`);
  return { stakeholderMap };
}
