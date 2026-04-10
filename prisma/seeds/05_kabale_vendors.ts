import {
  PrismaClient,
  StakeholderType,
  KycStatus,
  UserStatus,
  MfaType,
} from "@prisma/client";
import { hash } from "bcryptjs";
import * as fs from "fs";
import * as path from "path";

// ─────────────────────────────────────────────
// GLOBAL PHONE REGISTRY (IMPORTANT)
// ─────────────────────────────────────────────

const usedPhones = new Set<string>();

// ─── types ────────────────────────────────────

type VendorRow = {
  id: number;
  name: string;
  nin: string | number | null;
  phone: string | number;
  category: string;
  fcNo: string;
  monthlyPay: number;
};

export type VendorRecord = { vendorId: string; row: VendorRow };
export type MemberRecord = { memberId: string; row: VendorRow };

// ─── helpers ──────────────────────────────────

function normalisePhone(raw: string | number | null, fallbackBase: string): string {
  let phone = "";

  if (raw) {
    phone = String(raw).replace(/\D/g, "");
  }

  if (!phone || phone.length < 9) {
    phone = fallbackBase.replace(/\D/g, "");
  }

  phone = `+${phone}`;

  // ensure uniqueness globally
  let finalPhone = phone;
  let counter = 1;

  while (usedPhones.has(finalPhone)) {
    finalPhone = `${phone}${counter}`;
    counter++;
  }

  usedPhones.add(finalPhone);
  return finalPhone;
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

function splitName(name: string, id: number) {
  const parts = (name || "Vendor").trim().split(/\s+/);
  return {
    firstName: parts[0] ?? "Vendor",
    lastName: parts.slice(1).join(" ") || String(id),
  };
}

// ─── VENDOR SEEDER ───────────────────────────

async function seedVendorRows(
  prisma: PrismaClient,
  rows: VendorRow[],
  DEV_PASSWORD: string,
  marketId: string,
): Promise<VendorRecord[]> {

  console.log("🛒 Vendors...");

  const vendorRecords: VendorRecord[] = [];

  for (const row of rows) {
    const email = `vendor.${toEmailLocal(row.name, row.id)}@kabalemarket.ug`;
    const phone = normalisePhone(row.phone, `256701000${row.id}`);
    const { firstName, lastName } = splitName(row.name, row.id);

    try {
      const u = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          email,
          passwordHash: DEV_PASSWORD,
          phone,
          emailVerified: true,
          status: UserStatus.ACTIVE,
          mfaType: MfaType.NONE,
          profile: {
            create: {
              firstName,
              lastName,
              primaryPhone: phone,
              primaryEmail: email,
              occupation: row.category,
            },
          },
          stakeholder: {
            create: {
              stakeholderType: StakeholderType.VENDOR,
              kycStatus: KycStatus.VERIFIED,
              kycVerifiedAt: new Date(),
              vendor: {
                create: {
                  vendorCode: `VND-KBL-${String(row.id).padStart(4, "0")}`,
                  businessName: row.name.slice(0, 200),
                  businessType: row.category,
                  primaryMarketId: marketId,
                  vatRegistered: false,
                },
              },
            },
          },
        },
      });

      const sh = await prisma.stakeholder.findUniqueOrThrow({
        where: { userId: u.id },
      });

      const vn = await prisma.vendor.findUniqueOrThrow({
        where: { stakeholderId: sh.id },
      });

      vendorRecords.push({ vendorId: vn.id, row });

    } catch (e) {
      console.warn(`⚠️ Vendor ${row.id}: ${(e as Error).message}`);
    }
  }

  return vendorRecords;
}

// ─── MEMBER SEEDER  ────────

async function seedMembers(
  prisma: PrismaClient,
  rows: VendorRow[],
  DEV_PASSWORD: string,
): Promise<MemberRecord[]> {

  console.log("🏢 Members...");

  const memberRecords: MemberRecord[] = [];

  for (const row of rows) {
    console.log(row)
    const email = `${toEmailLocal(row.name, row.id)}@kabalemarket.ug`;
    const phone = normalisePhone(row.phone, `256700000${row.id}`);
    const { firstName, lastName } = splitName(row.name, row.id);

    try {
      const u = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          email,
          passwordHash: DEV_PASSWORD,
          phone,
          emailVerified: true,
          status: UserStatus.ACTIVE,
          mfaType: MfaType.NONE,
          profile: {
            create: {
              firstName,
              lastName,
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
                  membershipNumber: `MEM-KBL-${String(row.id).padStart(4, "0")}`,
                  membershipType: "REGULAR",
                  businessName: row.name.slice(0, 200),
                  businessType: row.category,
                  registrationNumber: `REG-KBL-${String(row.id).padStart(6, "0")}`,
                },
              },
            },
          },
        },
      });

      const sh = await prisma.stakeholder.findUniqueOrThrow({
        where: { userId: u.id },
      });

      const mb = await prisma.member.findUniqueOrThrow({
        where: { stakeholderId: sh.id },
      });

      memberRecords.push({
        memberId: mb.id,
        row,
      });

    } catch (e) {
      console.warn(`⚠️ Member ${row.id}: ${(e as Error).message}`);
    }
  }

  return memberRecords;
}

// ─── PUBLIC ENTRY ────────────────────────────

export async function seedKabaleVendors(
  prisma: PrismaClient,
  marketId: string,
): Promise<{
  memberRecords: MemberRecord[];
  vendorRecords: VendorRecord[];
}> {

  console.log("\n🌱 Seeding Kabale Vendors...");

  const DEV_PASSWORD = await hash("Password@123", 10);

  const jsonPath = path.join(__dirname, "../data/kabale_vendors.json");
  const rows: VendorRow[] = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

  const memberRecords = await seedMembers(prisma, rows, DEV_PASSWORD);
  const vendorRecords = await seedVendorRows(prisma, rows, DEV_PASSWORD, marketId);

  console.log(`✅ Members: ${memberRecords.length}, Vendors: ${vendorRecords.length}`);

  return { memberRecords, vendorRecords };
}