import { PrismaClient, ShopType } from "@prisma/client";
import * as fs from 'fs';
import * as path from 'path';

function toShopType(cat: string): ShopType {
  switch (cat) {
    case "Retail Shops":          return ShopType.RETAIL;
    case "New Clothes":           return ShopType.CLOTHING;
    case "Food Stuff":
    case "Vegetables":
    case "Fish":
    case "Cereal Produce":
    case "Butcher":
    case "Birds":                 return ShopType.FOOD;
    case "Saloon":
    case "Tailoring and Textile": return ShopType.SERVICE;
    case "Hardware":              return ShopType.OTHER;
    case "General Merchandise":   return ShopType.OTHER;
    default:                      return ShopType.OTHER;
  }
}

function toCategoryTag(cat: string): string {
  switch (cat) {
    case "Retail Shops":          return "RETAIL";
    case "New Clothes":           return "CLOTHING";
    case "Vegetables":
    case "Food Stuff":
    case "Fish":
    case "Cereal Produce":
    case "Butcher":
    case "Birds":                 return "FOOD";
    case "Saloon":
    case "Tailoring and Textile": return "SERVICE";
    case "Hardware":
    case "General Merchandise":
    default:                      return "GENERAL";
  }
}

export async function seedKabaleShops(
  prisma: PrismaClient,
  marketId: string,
  marketMasterRecordId: string,
  marketMasterUserId: string,
  levelMap: Record<string, string>,
  sectionMap: Record<string, string>,
  stakeholderMap: Record<number, string>
) {
  console.log('\n=======================================');
  console.log('🌱 Seeding Kabale Shops...');
  console.log('=======================================');

  const jsonPath = path.join(__dirname, '../data/kabale_shops.json');
  const rawData = fs.readFileSync(jsonPath, 'utf8');
  const FTS_ROWS = JSON.parse(rawData);

  const getSectionId = (cat: string) => sectionMap[toCategoryTag(cat)] ?? sectionMap["GENERAL"];

  for (let i = 0; i < FTS_ROWS.length; i++) {
    const row = FTS_ROWS[i];
    const memberId = stakeholderMap[row.id];

    if (!memberId) {
      console.warn(`Skipping shop creation for row ${row.id} - no associated member found.`);
      continue;
    }

    try {
      const secId = getSectionId(row.category);
      const levelId = levelMap[row.level || "UNKNOWN"];
      
      if (!levelId) throw new Error(`Level Not Found for FC NO: ${row.level}`);
      if (!secId) throw new Error(`Section Not Found for Category: ${row.category}`);
      
      if (i % 50 === 0) console.log(`Progress: ${i}/850 shops created`);

      const shopNum = `SHOP-${row.id}`;
      const uniqueCode = `MKT-KBL-001-${String(row.id).padStart(5, "0")}`;

      const shop = await prisma.shop.upsert({
        where: { uniqueCode },
        update: {},
        create: {
          marketId,
          levelId,
          sectionId: secId,
          memberId,
          uniqueCode,
          shopNumber: shopNum,
          shopName: (row.shopName || '').slice(0, 200),
          shopType: toShopType(row.category),
          categoryTags: [toCategoryTag(row.category)],
          monthlyRent: row.monthlyPay,
          securityDeposit: row.monthlyPay * 2,
          contractStartDate: new Date("2024-01-01"),
          contractEndDate: new Date("2025-12-31"),
          marketMasterId: marketMasterRecordId,
          createdById: marketMasterUserId,
        },
      });

      if (i > 0 && i % 100 === 0) {
        console.log(`... seeded ${i} shops.`);
      }
    } catch (e) {
      console.warn(`Error creating shop for row ${row.id}: ${(e as Error).message}`);
    }
  }

  console.log(`✅ Kabale Shops Created successfully!`);
}
