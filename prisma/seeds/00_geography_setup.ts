import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

export async function seedGeography(prisma: PrismaClient) {
  console.log('\n=======================================');
  console.log('🌍 Seeding Geography (Geolocations, Districts, Cities)...');
  console.log('=======================================');

  const jsonPath = path.join(__dirname, '../data/geography_data.json');
  console.log(`Loading geography data from ${jsonPath}...`);
  const rawData = fs.readFileSync(jsonPath, 'utf8');
  const geoData = JSON.parse(rawData);

  const geoMap: Record<string, string> = {};
  for (const g of geoData.geolocations) {
    const geo = await prisma.geolocation.upsert({
      where: { code: g.code },
      update: {},
      create: {
        id: g.id,
        name: g.name,
        code: g.code,
        country: g.country,
        countryCode: g.countryCode,
        timezone: g.timezone,
        currency: g.currency,
        language: g.language,
        regionType: g.regionType
      }
    });
    geoMap[g.code] = geo.id;
    console.log(`✅ Geolocation: ${g.name} (${g.code})`);
  }

  const districtMap: Record<string, string> = {};
  for (const d of geoData.districts) {
    const district = await prisma.district.upsert({
      where: { code: d.code },
      update: {},
      create: {
        geolocationId: geoMap[d.geolocationCode],
        name: d.name,
        code: d.code,
        districtType: d.districtType,
      }
    });
    districtMap[d.code] = district.id;
    console.log(`✅ District: ${d.name} (${d.code})`);
  }

  const cityMap: Record<string, string> = {};
  for (const c of geoData.cities) {
    const city = await prisma.city.upsert({
      where: { code: c.code },
      update: {},
      create: {
        districtId: districtMap[c.districtCode],
        name: c.name,
        code: c.code,
        cityType: c.cityType,
      }
    });
    cityMap[c.code] = city.id;
    console.log(`✅ City: ${c.name} (${c.code})`);
  }

  return { geoMap, districtMap, cityMap };
}
