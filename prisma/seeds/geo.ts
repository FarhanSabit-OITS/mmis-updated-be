import { PrismaClient } from "@prisma/client";

export async function seedGeo(prisma: PrismaClient) {
  console.log("📍 Seeding Geography (Districts & Cities)...");

  const regions = [
    {
      name: "Central Region",
      code: "UG-C",
      districts: [
        { 
          name: "Jinja District", 
          code: "JIN-DIST", 
          city: { name: "Jinja City", code: "JIN-CITY" } 
        }
      ]
    },
    {
      name: "South Western Region",
      code: "UG-SW",
      districts: [
        { 
          name: "Kabale District", 
          code: "KBL-DIST", 
          city: { name: "Kabale Municipality", code: "KAB-CITY" } 
        },
        { 
          name: "Mbarara District", 
          code: "MBR-DIST", 
          city: { name: "Mbarara City", code: "MBR-CITY" } 
        }
      ]
    },
    {
      name: "Northern Region",
      code: "UG-N",
      districts: [
        { 
          name: "Gulu District", 
          code: "GLU-DIST", 
          city: { name: "Gulu City", code: "GLU-CITY" } 
        }
      ]
    }
  ];

  const cityMap: Record<string, string> = {};

  for (const reg of regions) {
    const geo = await prisma.geolocation.upsert({
      where: { code: reg.code },
      update: {},
      create: {
        name: reg.name,
        code: reg.code,
        country: "Uganda",
        countryCode: "UG",
        timezone: "Africa/Kampala",
        currency: "UGX",
        language: "en",
        regionType: "REGION",
      },
    });

    for (const d of reg.districts) {
      const district = await prisma.district.upsert({
        where: { code: d.code },
        update: {},
        create: {
          geolocationId: geo.id,
          name: d.name,
          code: d.code,
          districtType: "MUNICIPALITY_DISTRICT",
        },
      });

      const city = await prisma.city.upsert({
        where: { code: d.city.code },
        update: {},
        create: {
          districtId: district.id,
          name: d.city.name,
          code: d.city.code,
          cityType: "MUNICIPALITY",
        },
      });

      cityMap[d.name.replace(" District", "")] = city.id;
    }
  }

  return cityMap;
}
