const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function assignVendorRoles() {
  try {
    console.log('🔄 Assigning VENDOR role to all Kabale imported vendors...\n');

    // 1. Get the Vendor role
    const vendorRole = await prisma.role.findUnique({
      where: { name: 'Vendor' }
    });

    if (!vendorRole) {
      throw new Error('Vendor role not found in database');
    }

    console.log(`✅ Found Vendor role: ${vendorRole.id}`);

    // 2. Get all users who have Vendor stakeholder records but no Vendor role
    const vendors = await prisma.vendor.findMany({
      include: {
        stakeholder: {
          include: {
            user: true
          }
        }
      }
    });

    console.log(`\n📊 Found ${vendors.length} total vendor records`);

    let assigned = 0;
    let skipped = 0;

    for (const vendor of vendors) {
      const userId = vendor.stakeholder.user.id;
      const email = vendor.stakeholder.user.email;

      // Check if user already has Vendor role
      const existingRole = await prisma.userRole.findFirst({
        where: {
          userId: userId,
          roleId: vendorRole.id
        }
      });

      if (existingRole) {
        skipped++;
        console.log(`⏭️  ${email} - Already has VENDOR role`);
      } else {
        // Assign Vendor role
        await prisma.userRole.create({
          data: {
            userId: userId,
            roleId: vendorRole.id
          }
        });

        assigned++;
        console.log(`✅ ${email} - VENDOR role assigned`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📋 SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Roles assigned: ${assigned}`);
    console.log(`⏭️  Already assigned: ${skipped}`);
    console.log(`📊 Total processed: ${assigned + skipped}`);
    console.log('='.repeat(60));
    console.log('\n✨ All Kabale vendors now have VENDOR role!');
    console.log('They can now login and see their vendor dashboard.\n');

  } catch (error) {
    console.error('❌ Error assigning roles:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

assignVendorRoles();
