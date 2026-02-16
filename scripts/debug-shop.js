const { PrismaClient } = require('@prisma/client');

async function test() {
  const p = new PrismaClient();
  
  try {
    const admin = await p.user.findFirst({ where: { userRoles: { some: { role: { name: 'SuperAdmin' } } } } });
    console.log('SuperAdmin:', admin?.email);

    const market = await p.market.findUnique({ where: { uniqueCode: 'KABALE_CENTRAL_001' } });
    console.log('Market:', market?.id);
    
    const level = await p.marketLevel.findFirst({ where: { marketId: market?.id } });
    console.log('Level:', level?.id);
    
    const vendor = await p.vendor.findFirst({ where: { primaryMarketId: market?.id } });
    console.log('Sample Vendor ID:', vendor?.id);
    
    // Try to create a shop
    const shop = await p.shop.create({
      data: {
        marketId: market?.id,
        levelId: level?.id,
        uniqueCode: 'TEST-001',
        shopNumber: 'TEST-001',
        shopName: 'Test Shop',
        shopType: 'TEST',
        monthlyRent: 100000.00,
        contractStartDate: new Date(),
        contractEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        paymentDay: 1,
        status: 'ACTIVE',
        createdById: admin?.id
      }
    });
    console.log('✓ Shop created!', shop.id);
  } catch(e) {
    console.log('✗ Error:', e.message);
  } finally {
    await p.$disconnect();
  }
}

test();
