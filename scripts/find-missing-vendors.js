const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function findMissingVendors() {
  try {
    console.log('🔍 Finding vendors without contracts...\n');

    const vendorsWithoutContracts = await prisma.vendor.findMany({
      where: {
        primaryMarketId: '57b8f4b5-af9e-40fc-823b-e48797cd012b',
        rentContracts: { none: {} }
      },
      select: {
        id: true,
        businessName: true,
        businessType: true,
        vendorCode: true
      }
    });

    console.log(`Found ${vendorsWithoutContracts.length} vendors without contracts:\n`);
    vendorsWithoutContracts.forEach((v, i) => {
      console.log(`${i + 1}. ${v.businessName} (${v.vendorCode}) - Type: ${v.businessType}`);
    });

    if (vendorsWithoutContracts.length > 0) {
      console.log('\n💡 Note: These vendors may have been skipped due to errors or issues during Phase 5.');
      console.log('   You can manually create shops/contracts for them or debug their specific issues.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

findMissingVendors();
