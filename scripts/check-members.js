const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkExistingShops() {
  try {
    console.log('🔍 CHECKING EXISTING SHOPS STRUCTURE\n');

    // Get first existing shop
    const existingShop = await prisma.shop.findFirst({
      include: {
        member: true,
        rentContracts: { include: { tenant: true } },
        createdBy: true
      }
    });

    console.log('✅ Found existing shop:');
    console.log('  ID:', existingShop.id);
    console.log('  Name:', existingShop.shopName);
    console.log('  Member ID:', existingShop.memberId);
    console.log('\n📝 Member details:');
    console.log('  ID:', existingShop.member.id);
    console.log('  Stakeholder ID:', existingShop.member.stakeholderId);
    console.log('  Business Name:', existingShop.member.businessName);
    console.log('  Business Type:', existingShop.member.businessType);
    console.log('  Registration:', existingShop.member.registrationNumber);

    console.log('\n📊 Comparing with Member model:');
    console.log('  Members in DB:', await prisma.member.count());
    console.log('  Vendors in DB:', await prisma.vendor.count());
    console.log('  Shops in DB:', await prisma.shop.count());

    // Check if members are tied to vendors/stakeholders
    const memberWithStakeholder = await prisma.member.findFirst({
      include: { stakeholder: true }
    });

    if (memberWithStakeholder) {
      console.log('\n✅ Found member with stakeholder:');
      console.log('  Member ID:', memberWithStakeholder.id);
      console.log('  Stakeholder ID:', memberWithStakeholder.stakeholder.id);
      console.log('  Stakeholder Type:', memberWithStakeholder.stakeholder.userType);
      console.log('  Stakeholder Business:', memberWithStakeholder.stakeholder.businessName);
    }

    // Get a vendor to see if they're stakeholders
    const vendor = await prisma.vendor.findFirst({
      include: { stakeholder: true }
    });

    if (vendor) {
      console.log('\n✅ Found vendor:');
      console.log('  Vendor ID:', vendor.id);
      console.log('  Stakeholder ID:', vendor.stakeholderId);
      console.log('  Business Name:', vendor.businessName);

      // Check if this vendor's stakeholder has a corresponding member
      const memberForVendor = await prisma.member.findUnique({
        where: { stakeholderId: vendor.stakeholderId },
        include: { stakeholder: true }
      });

      if (memberForVendor) {
        console.log('\n✅ Vendor HAS a corresponding Member:');
        console.log('  Member ID:', memberForVendor.id);
        console.log('  Member shops:', await prisma.shop.count({ where: { memberId: memberForVendor.id } }));
      } else {
        console.log('\n❌ Vendor DOES NOT have a corresponding Member!');
        console.log('  This is the problem - shops need members but vendors don\'t have them');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkExistingShops();
