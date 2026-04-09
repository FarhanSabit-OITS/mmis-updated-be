const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  console.log('--- Database Verification Report ---');

  const marketCount = await prisma.market.count();
  const vendorCount = await prisma.vendor.count();
  const facilityCount = await prisma.facility.count();
  const stakeholderCount = await prisma.stakeholder.count();
  const userCount = await prisma.user.count();

  console.log(`Markets:      ${marketCount}`);
  console.log(`Vendors:      ${vendorCount}`);
  console.log(`Facilities:   ${facilityCount}`);
  console.log(`Stakeholders: ${stakeholderCount}`);
  console.log(`Users:        ${userCount}`);

  console.log('\n--- Breakdown by Market ---');
  const markets = await prisma.market.findMany({
    include: {
      _count: {
        select: {
          vendors: true,
          facilities: true,
        }
      }
    }
  });

  markets.forEach(m => {
    console.log(`${m.name}:`);
    console.log(`  Vendors:    ${m._count.vendors}`);
    console.log(`  Facilities: ${m._count.facilities}`);
  });

  console.log('\n--- Sample Check ---');
  const sampleVendor = await prisma.vendor.findFirst({
    include: {
      stakeholder: {
        include: {
          user: {
            include: {
              profile: true
            }
          }
        }
      },
      facilities: true
    }
  });

  if (sampleVendor) {
    console.log(`Vendor: ${sampleVendor.businessName}`);
    console.log(`  Name: ${sampleVendor.stakeholder.user.profile.firstName} ${sampleVendor.stakeholder.user.profile.lastName}`);
    console.log(`  NIN:  ${sampleVendor.stakeholder.user.profile.nationalId || 'N/A'}`);
    console.log(`  Facilities: ${sampleVendor.facilities.length}`);
  }

  await prisma.$disconnect();
}

verify();
