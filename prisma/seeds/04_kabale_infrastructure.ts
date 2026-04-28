import { PrismaClient, AdminLevel, MarketType, UserStatus, MfaType } from "@prisma/client";
import { hash } from "bcryptjs";

const SECTION_DEFS = [
  { code: "SEC-RETAIL", name: "Retail & General Shops", type: "RETAIL" },
  { code: "SEC-FOOD", name: "Food, Produce & Vegetables", type: "FOOD" },
  { code: "SEC-CLOTHES", name: "Clothing & Textiles", type: "CLOTHING" },
  { code: "SEC-SERVICE", name: "Services (Saloon, Tailoring)", type: "SERVICE" },
  { code: "SEC-GENERAL", name: "General Merchandise", type: "GENERAL" },
];

/**
 * Seeds Kabale Central Market infrastructure:
 *  - market master user + Admin + MarketMaster rows
 *  - the market itself
 *  - 1 market level  (levelMap key: "MAIN")
 *  - 5 sections      (sectionMap key: type tag e.g. "FOOD", "RETAIL" …)
 *
 * Returns levelMap and sectionMap for use by downstream seeders.
 */
export async function seedKabaleInfrastructure(
  prisma: PrismaClient,
  superAdminId: string,
  cityIdKBL: string,
) {
  console.log("\n=======================================");
  console.log("🌱 Seeding Kabale Infrastructure...");
  console.log("=======================================");

  const DEV_PASSWORD = await hash("Password@123", 10);

  const superAdminRecord = await prisma.admin.findFirstOrThrow({
    where: { userId: superAdminId },
  });

  // ── Market master ──────────────────────────────────────────────────────────
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

  // ── Market ─────────────────────────────────────────────────────────────────
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

  // ── Level — keyed "MAIN" so downstream seeders have a stable lookup key ───
  const mainLevel = await prisma.marketLevel.upsert({
    where: { uniqueCode: "MKT-KBL-001-LVL-1" },
    update: {},
    create: {
      marketId: market.id,
      levelNumber: 1,
      uniqueCode: "MKT-KBL-001-LVL-1",
      name: "Main Level",
      createdById: superAdminId,
    },
  });

  const levelMap: Record<string, string> = { MAIN: mainLevel.id };

  // ── Sections ───────────────────────────────────────────────────────────────
  const sectionMap: Record<string, string> = {};

  for (const sd of SECTION_DEFS) {
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
    console.log(`  ✅ Section: ${sd.name}`);
  }

  console.log("✅ Kabale Infrastructure created (1 level, 5 sections)");

  // ── Staff Seeding ─────────────────────────────────────────────────────────
  console.log("👥 Seeding Kabale Staff...");
  const staffMembers = [
    {
      email: "kabale.gate@marketmaster.ug",
      firstName: "James",
      lastName: "Mugisha",
      role: "GATE_COUNTER",
      employeeId: "EMP-KBL-GATE-001"
    },
    {
      email: "kabale.stock@marketmaster.ug",
      firstName: "Sarah",
      lastName: "Tumwebaze",
      role: "STOCK_COUNTER",
      employeeId: "EMP-KBL-STOCK-001"
    }
  ];

  for (const staff of staffMembers) {
    await prisma.user.upsert({
      where: { email: staff.email },
      update: {},
      create: {
        email: staff.email,
        passwordHash: DEV_PASSWORD,
        phone: "+2567080000" + (staff.role === "GATE_COUNTER" ? "10" : "11"),
        emailVerified: true,
        status: UserStatus.ACTIVE,
        mfaType: MfaType.NONE,
        profile: {
          create: {
            firstName: staff.firstName,
            lastName: staff.lastName,
            primaryPhone: "+2567080000" + (staff.role === "GATE_COUNTER" ? "10" : "11"),
            primaryEmail: staff.email,
          },
        },
        admin: {
          create: {
            adminLevel: AdminLevel.PSEUDO_MARKET_ADMIN,
            employeeId: staff.employeeId,
            assignedByAdminId: superAdminRecord.id,
            pseudoMarketAdmin: {
              create: {
                marketId: market.id,
                role: staff.role as any,
              }
            }
          },
        },
      },
    });
    console.log(`  ✅ Staff: ${staff.firstName} (${staff.role})`);
  }

  return {
    market,
    marketMasterRecord,
    marketMasterUser,
    levelMap,
    sectionMap,
  };
}