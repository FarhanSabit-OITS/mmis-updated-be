const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkStatus() {
  try {
    console.log('📊 CHECKING DATABASE STATUS\n');

    const totalShops = await prisma.shop.count();
    const totalContracts = await prisma.rentContract.count();
    const totalPayments = await prisma.rentPayment.count();
    const kabaleShops = await prisma.shop.count({ where: { marketId: '57b8f4b5-af9e-40fc-823b-e48797cd012b' } });
    const kabaleContracts = await prisma.rentContract.count({});
    
    const allVendors = await prisma.vendor.count({ where: { primaryMarketId: '57b8f4b5-af9e-40fc-823b-e48797cd012b' } });
    const vendorsWithContracts = await prisma.vendor.count({
      where: {
        primaryMarketId: '57b8f4b5-af9e-40fc-823b-e48797cd012b',
        rentContracts: { some: {} }
      }
    });

    console.log(`Total vendors in Kabale: ${allVendors}`);
    console.log(`Vendors with contracts: ${vendorsWithContracts}`);
    console.log(`Vendors WITHOUT contracts: ${allVendors - vendorsWithContracts}\n`);

    console.log(`Total shops in DB: ${totalShops}`);
    console.log(`Total shops in Kabale: ${kabaleShops}`);
    console.log(`Total rent contracts: ${totalContracts}`);
    console.log(`Total rent payments: ${totalPayments}\n`);

    // Show shop uniqueCode range
    const firstShop = await prisma.shop.findFirst({
      where: { marketId: '57b8f4b5-af9e-40fc-823b-e48797cd012b' },
      orderBy: { createdAt: 'asc' }
    });

    const lastShop = await prisma.shop.findFirst({
      where: { marketId: '57b8f4b5-af9e-40fc-823b-e48797cd012b' },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`First shop created: ${firstShop?.uniqueCode}`);
    console.log(`Last shop created: ${lastShop?.uniqueCode}\n`);

    // Show duplicate uniqueCodes
    const duplicates = await prisma.$queryRaw`
      SELECT "uniqueCode", COUNT(*) as count
      FROM shops
      WHERE "marketId" = '57b8f4b5-af9e-40fc-823b-e48797cd012b'
      GROUP BY "uniqueCode"
      HAVING COUNT(*) > 1
      LIMIT 5
    `;

    if (duplicates.length > 0) {
      console.log('⚠️  Found duplicate uniqueCodes:');
      duplicates.forEach(d => console.log(`  - ${d.uniqueCode}: ${d.count} entries`));
    } else {
      console.log('✅ No duplicate shop codes found');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkStatus();
