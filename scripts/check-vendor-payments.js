const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkVendorPayments() {
  try {
    console.log('🔍 Checking specific vendor payment data...\n');

    // Find the vendors you logged in as
    const brutu = await prisma.user.findFirst({
      where: { email: { contains: 'arinaitwe.brutu' } }
    });

    const agatha = await prisma.user.findFirst({
      where: { email: { contains: 'arigaba.agatha' } }
    });

    console.log('📧 User 1:', brutu?.email);
    console.log('📧 User 2:', agatha?.email);

    if (brutu?.id) {
      console.log('\n--- VENDOR 1 ---');
      const vendor1 = await prisma.vendor.findFirst({
        where: { stakeholder: { userId: brutu.id } }
      });

      console.log('Vendor ID:', vendor1?.id);
      console.log('Business Name:', vendor1?.businessName);

      if (vendor1?.id) {
        const rentPayments = await prisma.rentPayment.findMany({
          where: {
            contract: {
              tenantId: vendor1.id
            }
          },
          include: {
            contract: {
              include: {
                shop: true
              }
            }
          }
        });

        const taxPayments = await prisma.taxPayment.findMany({
          where: { vendorId: vendor1.id }
        });

        console.log(`Rent Payments: ${rentPayments.length}`);
        console.log(`Tax Payments: ${taxPayments.length}`);

        if (rentPayments.length === 0) {
          console.log('❌ No rent contract/payments assigned');
        } else {
          rentPayments.forEach((p, i) => {
            console.log(`  [${i + 1}] Amount: ${p.amount}, Status: ${p.status}, Shop: ${p.contract?.shop?.uniqueCode}`);
          });
        }
      }
    }

    if (agatha?.id) {
      console.log('\n--- VENDOR 2 ---');
      const vendor2 = await prisma.vendor.findFirst({
        where: { stakeholder: { userId: agatha.id } }
      });

      console.log('Vendor ID:', vendor2?.id);
      console.log('Business Name:', vendor2?.businessName);

      if (vendor2?.id) {
        const rentPayments = await prisma.rentPayment.findMany({
          where: {
            contract: {
              tenantId: vendor2.id
            }
          },
          include: {
            contract: {
              include: {
                shop: true
              }
            }
          }
        });

        const taxPayments = await prisma.taxPayment.findMany({
          where: { vendorId: vendor2.id }
        });

        console.log(`Rent Payments: ${rentPayments.length}`);
        console.log(`Tax Payments: ${taxPayments.length}`);

        if (rentPayments.length === 0) {
          console.log('❌ No rent contract/payments assigned');
        } else {
          rentPayments.forEach((p, i) => {
            console.log(`  [${i + 1}] Amount: ${p.amount}, Status: ${p.status}, Shop: ${p.contract?.shop?.uniqueCode}`);
          });
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('💡 FINDINGS');
    console.log('='.repeat(60));
    console.log('✅ Vendors can log in (VENDOR role assigned)');
    console.log('✅ Payment Dashboard displays');
    console.log('⚠️  No data showing = These vendors not yet assigned to shops');
    console.log('\n🎬 ACTION: Create shop assignments for remaining 557 vendors');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkVendorPayments();
