import { PrismaClient, ShopType } from "@prisma/client";

// ─── types ─────────────────────────────────────

type VendorRow = {
  id: number;
  name: string;
  nin: string | number | null;
  phone: string | number;
  category: string;
  fcNo: string;
  monthlyPay: number;
};

export type MemberRecord = {
  memberId: string;
  row: VendorRow;
};

// ─── helpers ───────────────────────────────────

function toShopType(cat: string): ShopType {
  switch (cat) {
    case "Retail Shops":
      return ShopType.RETAIL;

    case "New Clothes":
      return ShopType.CLOTHING;

    case "Food Stuff":
    case "Vegetables":
    case "Fish":
    case "Cereal Produce":
    case "Butcher":
    case "Birds":
      return ShopType.FOOD;

    case "Saloon":
    case "Tailoring and Textile":
      return ShopType.SERVICE;

    default:
      return ShopType.OTHER;
  }
}

function toCategoryTag(cat: string): string {
  switch (cat) {
    case "Retail Shops":
      return "RETAIL";

    case "New Clothes":
      return "CLOTHING";

    case "Food Stuff":
    case "Vegetables":
    case "Fish":
    case "Cereal Produce":
    case "Butcher":
    case "Birds":
      return "FOOD";

    case "Saloon":
    case "Tailoring and Textile":
      return "SERVICE";

    default:
      return "GENERAL";
  }
}

function toShopName(name: string): string {
  const cleaned = (name || "Vendor")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return `${cleaned}'s Shop`;
}

// ─── MAIN SEEDER ───────────────────────────────

export async function seedKabaleShops(
  prisma: PrismaClient,
  marketId: string,
  marketMasterRecordId: string,
  marketMasterUserId: string,
  levelMap: Record<string, string>,
  sectionMap: Record<string, string>,
  memberRecords: MemberRecord[],
): Promise<void> {
  console.log("\n🌱 Seeding Kabale Shops...");
  console.log(`📦 Input members: ${memberRecords.length}`);

  const levelId = levelMap["MAIN"];

  if (!levelId) {
    throw new Error('❌ Missing levelMap["MAIN"] — infrastructure not seeded properly');
  }

  let created = 0;
  let skipped = 0;

  for (const record of memberRecords) {
    const { row, memberId } = record;

    const tag = toCategoryTag(row.category);
    const sectionId = sectionMap[tag] ?? sectionMap["GENERAL"];

    if (!sectionId) {
      console.warn(`⚠️ No section for tag ${tag} (row ${row.id})`);
      skipped++;
      continue;
    }

    const uniqueCode = `MKT-KBL-001-${String(row.id).padStart(5, "0")}`;

    try {
      await prisma.shop.upsert({
        where: { uniqueCode },
        update: {},
        create: {
          marketId,
          levelId,
          sectionId,
          memberId,

          uniqueCode,
          shopNumber: `SHOP-${row.id}`,
          shopName: toShopName(row.name).slice(0, 200),

          shopType: toShopType(row.category),
          categoryTags: [tag],

          monthlyRent: row.monthlyPay,
          securityDeposit: row.monthlyPay * 2,

          contractStartDate: new Date("2024-01-01"),
          contractEndDate: new Date("2025-12-31"),

          marketMasterId: marketMasterRecordId,
          createdById: marketMasterUserId,
        },
      });

      created++;
    } catch (e) {
      console.warn(`⚠️ Shop creation failed (row ${row.id}): ${(e as Error).message}`);
      skipped++;
    }

    if (created > 0 && created % 100 === 0) {
      console.log(`... processed ${created} shops`);
    }
  }

  console.log("\n==================================");
  console.log(`✅ Shops Seeding Complete`);
  console.log(`✔ Created: ${created}`);
  console.log(`⚠️ Skipped: ${skipped}`);
  console.log("==================================\n");
}