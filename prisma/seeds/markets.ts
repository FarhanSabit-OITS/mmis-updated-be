import { PrismaClient, MarketType } from "@prisma/client";

export async function seedMarkets(prisma: PrismaClient, cityMap: Record<string, string>, adminId: string) {
  console.log("🏪 Seeding Core Market Definitions...");

  const marketDefs = [
    {
      name: "Kabale Central Market",
      code: "MKT-KABALE",
      cityKey: "Kabale",
      address: "Market Road, Kabale Municipality",
      type: MarketType.PERMANENT,
    },
    {
      name: "Mbarara Marketplace",
      code: "MKT-MBARARA",
      cityKey: "Mbarara",
      address: "Mbarara High Street",
      type: MarketType.PERMANENT,
    },
    {
      name: "Jinja Central Market",
      code: "MKT-JINJA",
      cityKey: "Jinja",
      address: "Main Street, Jinja City",
      type: MarketType.PERMANENT,
    },
    {
      name: "Gulu Main Market",
      code: "MKT-GULU",
      cityKey: "Gulu",
      address: "Market Street, Gulu City",
      type: MarketType.PERMANENT,
    }
  ];

  const marketMap: Record<string, any> = {};

  for (const m of marketDefs) {
    const cityId = cityMap[m.cityKey];
    if (!cityId) {
      console.warn(`⚠️ City not found for market ${m.name}: ${m.cityKey}`);
      continue;
    }

    const market = await prisma.market.upsert({
      where: { uniqueCode: m.code },
      update: {},
      create: {
        cityId,
        name: m.name,
        uniqueCode: m.code,
        displayName: m.name,
        address: m.address,
        marketType: m.type,
        categories: ["FOOD", "CLOTHING", "RETAIL", "GENERAL"],
        createdByAdminId: adminId,
        status: "ACTIVE",
      },
    });
    marketMap[m.code] = market;
  }

  return marketMap;
}
