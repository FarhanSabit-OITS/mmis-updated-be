import { PrismaClient, AdminLevel, PseudoMarketRole, MarketType, UserStatus, MfaType } from "@prisma/client";
import { hash } from "bcryptjs";
import * as fs from 'fs';
import * as path from 'path';

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

export async function seedKabaleInfrastructure(prisma: PrismaClient, superAdminId: string, cityIdKBL: string) {
  console.log('\n=======================================');
  console.log('🌱 Seeding Kabale Infrastructure...');
  console.log('=======================================');

  const DEV_PASSWORD = await hash("Password@123", 10);

  const superAdminRecord = await prisma.admin.findFirst({
    where: { userId: superAdminId },
  });

  if (!superAdminRecord) throw new Error("SuperAdmin record not found");

  const marketMasterUser = await prisma.user.upsert({
    where: { email: "marketmaster@kabalemarket.ug" },
    update: {},
    create: {
      email: "marketmaster@kabalemarket.ug",
      passwordHash: DEV_PASSWORD,
      phone: "+256708000002",
      emailVerified: true,
      status: UserStatus.ACTIVE,
      mfaType: MfaType.NONE,
      profile: {
        create: {
          firstName: "John",
          lastName: "Byaruhanga",
          primaryPhone: "+256708000002",
          primaryEmail: "marketmaster@kabalemarket.ug",
        },
      },
      admin: {
        create: {
          adminLevel: AdminLevel.MARKET_MASTER,
          employeeId: "EMP-KBL-0002",
          assignedByAdminId: superAdminRecord.id,
        },
      },
    },
  });

  const market = await prisma.market.upsert({
    where: { uniqueCode: "MKT-KBL-001" },
    update: {},
    create: {
      cityId: cityIdKBL,
      name: "Kabale Central Market",
      uniqueCode: "MKT-KBL-001",
      displayName: "Kabale Central Market",
      address: "Market Road, Kabale Municipality",
      marketType: MarketType.PERMANENT,
      categories: ["FOOD", "CLOTHING", "RETAIL", "SERVICE", "GENERAL"],
      totalLevels: 1,
      openingTime: "07:00",
      closingTime: "19:00",
      contactPhone: "+256708000099",
      createdByAdminId: superAdminRecord.id,
    },
  });

  const marketMasterAdminRecord = await prisma.admin.findUniqueOrThrow({
    where: { userId: marketMasterUser.id },
  });
  
  const marketMasterRecord = await prisma.marketMaster.upsert({
    where: { adminId: marketMasterAdminRecord.id },
    update: {},
    create: {
      adminId: marketMasterAdminRecord.id,
      marketId: market.id,
    },
  });
  
  const sectionDefs = [
    { code: "SEC-RETAIL",  name: "Retail & General Shops",      type: "RETAIL"   },
    { code: "SEC-FOOD",    name: "Food, Produce & Vegetables",   type: "FOOD"     },
    { code: "SEC-CLOTHES", name: "Clothing & Textiles",          type: "CLOTHING" },
    { code: "SEC-SERVICE", name: "Services (Saloon, Tailoring)", type: "SERVICE"  },
    { code: "SEC-GENERAL", name: "General Merchandise",          type: "GENERAL"  },
  ];

  const sectionMap: Record<string, string> = {}; 

  for (const sd of sectionDefs) {
    const secCode = `MKT-KBL-001-${sd.code}`;
    const sec = await prisma.marketSection.upsert({
      where: { uniqueCode: secCode },
      update: {},
      create: {
        marketId: market.id,
        uniqueCode: secCode,
        name: sd.name,
        sectionType: sd.type,
        categoryTags: [sd.type],
        createdById: superAdminId,
      },
    });
    sectionMap[sd.type] = sec.id;
  }

  // Generate levels dynamically based on JSON
  const jsonPath = path.join(__dirname, '../data/kabale_shops.json');
  console.log(`Loading levels from ${jsonPath}...`);
  const rawData = fs.readFileSync(jsonPath, 'utf8');
  const FTS_ROWS = JSON.parse(rawData);
  const levelMap: Record<string, string> = {};

  const mainLvl = await prisma.marketLevel.upsert({
    where: { uniqueCode: 'MKT-KBL-001-LVL-1' },
    update: {},
    create: {
      marketId: market.id,
      levelNumber: 1,
      uniqueCode: 'MKT-KBL-001-LVL-1',
      name: 'Main Level',
      createdById: superAdminId
    }
  });

  // Map all raw fcNo strings to this single level
  for (const rawLvl of Array.from(new Set(FTS_ROWS.map((r: any) => r.level || 'UNKNOWN')))) {
    levelMap[rawLvl as string] = mainLvl.id;
  }
  console.log(`✅ Kabale Infrastructure Created! (1 Main Level)`);

  return { market, marketMasterRecord, marketMasterUser, levelMap, sectionMap };
}
