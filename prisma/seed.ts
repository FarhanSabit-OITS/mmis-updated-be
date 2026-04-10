import { PrismaClient } from '@prisma/client';

import { seedGeography } from './seeds/00_geography_setup';
import { seedRoles } from './seeds/01_roles_setup';
import { seedSystemAdmins } from './seeds/02_system_admins_setup';
import { seedNakaseroOwino } from './seeds/03_nakasero_owino';
import { seedKabaleInfrastructure } from './seeds/04_kabale_infrastructure';
import { seedKabaleVendors } from './seeds/05_kabale_vendors';
import { seedKabaleShops } from './seeds/06_kabale_shops';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Modularized Data Seeding Process...');

  try {
    // 0. Geography Setup
    const { cityMap } = await seedGeography(prisma);

    // 1. Roles Setup
    const { roleMap } = await seedRoles(prisma);

    // 2. System Admins Setup
    const { superAdminUser1 } = await seedSystemAdmins(prisma, roleMap);

    // 3. Nakasero & Owino Setup
    await seedNakaseroOwino(prisma, roleMap, cityMap['KLA']);

    // 4. Kabale Infrastructure Setup
    const {
      market,
      marketMasterRecord,
      marketMasterUser,
      levelMap,
      sectionMap
    } = await seedKabaleInfrastructure(
      prisma,
      superAdminUser1.id,
      cityMap['KBL-CITY']
    );

    // 5. Kabale Vendors / Members
    const { memberRecords } = await seedKabaleVendors(
      prisma,
      market.id
    );

    // 6. Kabale Shops (NOW ENABLED)
    await seedKabaleShops(
      prisma,
      market.id,
      marketMasterRecord.id,
      marketMasterUser.id,
      levelMap,
      sectionMap,
      memberRecords
    );

    console.log('\n=======================================');
    console.log('✅ ALL SEEDS COMPLETED SUCCESSFULLY');
    console.log('=======================================');
    console.log('Test Accounts:');
    console.log('  superadmin@marketmaster.com / superadmin123');
    console.log('  superadmin@kabalemarket.ug / Password@123');
    console.log('  nakasero.manager@marketmaster.com / market123');
    console.log('  owino.manager@marketmaster.com / market123');
    console.log('=======================================\n');

  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('❌ Fatal Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });