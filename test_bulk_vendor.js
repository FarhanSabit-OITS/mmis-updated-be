const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const vendorService = require('./src/services/vendor.service');

async function testBulkUpload() {
  console.log('--- Testing Vendor Bulk Upload ---');
  
  const testVendors = [
    {
      email: 'vendor123@test.com',
      firstName: 'John',
      lastName: 'Doe',
      businessName: 'John Electronics',
      businessType: 'Retail',
      primaryMarketId: null,
      phone: '+256700000001'
    },
    {
      email: 'vendor456@test.com',
      firstName: 'Jane',
      lastName: 'Smith',
      businessName: 'Jane Groceries',
      businessType: 'Food',
      primaryMarketId: null,
      phone: '+256700000002'
    }
  ];

  try {
    const results = await vendorService.bulkCreateVendors(testVendors);
    console.log('✅ Bulk Results:', JSON.stringify(results, null, 2));

    // Cleanup
    console.log('Cleaning up test data...');
    
    // Find vendor rows
    const vendors = await prisma.vendor.findMany({
      where: {
        stakeholder: {
          user: { email: { in: testVendors.map(v => v.email) } }
        }
      },
      include: { stakeholder: true }
    });

    const userIds = vendors.map(v => v.stakeholder.userId);
    const stakeholderIds = vendors.map(v => v.stakeholderId);

    if (userIds.length > 0) {
      await prisma.invitation.deleteMany({ where: { email: { in: testVendors.map(v => v.email) } }});
      await prisma.vendor.deleteMany({ where: { stakeholderId: { in: stakeholderIds } }});
      await prisma.stakeholder.deleteMany({ where: { id: { in: stakeholderIds } }});
      await prisma.userRole.deleteMany({ where: { userId: { in: userIds } }});
      await prisma.profile.deleteMany({ where: { userId: { in: userIds } }});
      await prisma.user.deleteMany({ where: { id: { in: userIds } }});
    }
    
    console.log('✅ Cleanup completed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testBulkUpload();
