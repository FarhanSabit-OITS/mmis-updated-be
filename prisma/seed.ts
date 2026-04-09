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

    // 4. Kabale Central Market Infrastructure Setup
    const { market, marketMasterRecord, marketMasterUser, levelMap, sectionMap } = await seedKabaleInfrastructure(prisma, superAdminUser1.id, cityMap['KBL-CITY']);

    // 5. Kabale Market Vendors/Members
    const { stakeholderMap } = await seedKabaleVendors(prisma);

    // 6. Kabale Market Shops
    await seedKabaleShops(prisma, market.id, marketMasterRecord.id, marketMasterUser.id, levelMap, sectionMap, stakeholderMap);

    console.log('\n=======================================');
    console.log('✅ ALL SEEDS COMPLETED SUCCESSFULLY');
    console.log('=======================================');
    console.log('Test Accounts:');
    console.log('  superadmin@marketmaster.com / superadmin123 (SuperAdmin)');
    console.log('  superadmin@kabalemarket.ug  / Password@123 (SuperAdmin - Kabale)');
    console.log('  nakasero.manager@marketmaster.com / market123 (Nakasero Master)');
    console.log('  owino.manager@marketmaster.com / market123 (Owino Master)');
    console.log('  marketmaster@kabalemarket.ug / Password@123 (Kabale Master)');
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