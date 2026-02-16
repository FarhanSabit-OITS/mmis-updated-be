const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkPaymentData() {
  try {
    console.log('🔍 Checking payment data structure...\n');

    // Get Kabale market
    const kabale = await prisma.market.findFirst({
      where: { uniqueCode: 'KABALE_CENTRAL_001' }
    });

    if (!kabale) {
      console.log('❌ Kabale market not found');
      return;
    }

    console.log(`✅ Kabale Market ID: ${kabale.id}`);

    // Count shops
    const shops = await prisma.shop.count({
      where: { marketId: kabale.id }
    });
    console.log(`📊 Shops in Kabale: ${shops}`);

    // Count rent contracts
    const rentContracts = await prisma.rentContract.count();
    console.log(`📊 Total rent contracts: ${rentContracts}`);

    // Count rent payments
    const rentPayments = await prisma.rentPayment.count();
    console.log(`📊 Total rent payments: ${rentPayments}`);

    // Count tax payments
    const taxPayments = await prisma.taxPayment.count();
    console.log(`📊 Total tax payments: ${taxPayments}`);

    // Count vendors in Kabale
    const vendors = await prisma.vendor.count({
      where: { primaryMarketId: kabale.id }
    });
    console.log(`📊 Vendors in Kabale: ${vendors}`);

    console.log('\n' + '='.repeat(60));
    console.log('📋 DATA SUMMARY');
    console.log('='.repeat(60));

    if (shops === 0) {
      console.log('❌ NO SHOPS - Need to create shops/stalls first');
    } else {
      console.log(`✅ ${shops} shops exist`);
    }

    if (rentContracts === 0) {
      console.log('❌ NO RENT CONTRACTS - Need to link vendors to shops');
    } else {
      console.log(`✅ ${rentContracts} rent contracts exist`);
    }

    if (rentPayments === 0) {
      console.log('❌ NO RENT PAYMENTS - Need to create payment records');
    } else {
      console.log(`✅ ${rentPayments} rent payments exist`);
    }

    if (taxPayments === 0) {
      console.log('❌ NO TAX PAYMENTS - Need to set up tax configuration');
    } else {
      console.log(`✅ ${taxPayments} tax payments exist`);
    }

    console.log('\n💡 NEXT STEPS:');
    console.log('='.repeat(60));
    console.log('1️⃣  Create shops/stalls for the 813 vendors');
    console.log('2️⃣  Create rent contracts linking vendors to shops');
    console.log('3️⃣  Create initial payment records (rent & tax)');
    console.log('4️⃣  Then vendors will see data in Payment Dashboard');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkPaymentData();
