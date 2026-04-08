const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const path = require('path');
const crypto = require('crypto');

const prisma = new PrismaClient();
const DATA_DIR = path.join(process.cwd(), 'Data');

async function seed() {
  console.log('--- Starting Comprehensive Market Registry Seeding ---');

  // 1. Geography: District & City
  const districts = [
    { name: 'Jinja', code: 'UG-JIN' },
    { name: 'Kabale', code: 'UG-KAB' },
    { name: 'Mbarara', code: 'UG-MBA' }
  ];

  for (const d of districts) {
    await prisma.district.upsert({
      where: { code: d.code },
      update: {},
      create: {
        name: d.name,
        code: d.code,
        geolocation: { 
          create: { 
            name: `${d.name} Region`, 
            code: `GEO-${d.code}`,
            country: 'Uganda',
            countryCode: 'UG'
          } 
        }
      }
    });
  }


  const jinjaDist = await prisma.district.findUnique({ where: { code: 'UG-JIN' } });
  const kabaleDist = await prisma.district.findUnique({ where: { code: 'UG-KAB' } });
  const mbararaDist = await prisma.district.findUnique({ where: { code: 'UG-MBA' } });

  const cities = [
    { name: 'Jinja City', code: 'JIN-01', districtId: jinjaDist.id },
    { name: 'Kabale Municipality', code: 'KAB-01', districtId: kabaleDist.id },
    { name: 'Mbarara City', code: 'MBA-01', districtId: mbararaDist.id }
  ];

  for (const c of cities) {
    await prisma.city.upsert({
      where: { code: c.code },
      update: {},
      create: {
        name: c.name,
        code: c.code,
        districtId: c.districtId
      }
    });
  }

  const jinjaCity = await prisma.city.findUnique({ where: { code: 'JIN-01' } });
  const kabaleCity = await prisma.city.findUnique({ where: { code: 'KAB-01' } });
  const mbararaCity = await prisma.city.findUnique({ where: { code: 'MBA-01' } });

  // 2. Core Users (Admin & System Member)
  const systemAdmin = await prisma.user.upsert({
    where: { email: 'admin@marketmaster.ug' },
    update: {},
    create: {
      email: 'admin@marketmaster.ug',
      passwordHash: crypto.createHash('sha256').update('Admin123!').digest('hex'),
      phone: '+256000000000',
      profile: { 
        create: { 
          firstName: 'System', 
          lastName: 'Admin',
          primaryPhone: '+256000000000',
          primaryEmail: 'admin@marketmaster.ug'
        } 
      }
    }
  });

  const memberUser = await prisma.user.upsert({
    where: { email: 'authority@marketmaster.ug' },
    update: {},
    create: {
      email: 'authority@marketmaster.ug',
      passwordHash: crypto.createHash('sha256').update('Auth123!').digest('hex'),
      phone: '+256000000001',
      profile: { 
        create: { 
          firstName: 'Market', 
          lastName: 'Authority',
          primaryPhone: '+256000000001',
          primaryEmail: 'authority@marketmaster.ug'
        } 
      }
    }
  });


  const memberStakeholder = await prisma.stakeholder.upsert({
    where: { userId: memberUser.id },
    update: {},
    create: {
      userId: memberUser.id,
      stakeholderType: 'MEMBER'
    }
  });

  const systemMember = await prisma.member.upsert({
    where: { stakeholderId: memberStakeholder.id },
    update: {},
    create: {
      stakeholderId: memberStakeholder.id,
      membershipNumber: 'MEMBER-001',
      businessName: 'Market Management Authority',
      registrationNumber: 'REG-001'
    }
  });

  // 3. Markets
  const markets = [
    { name: 'Jinja Central Market', uniqueCode: 'JCM-001', cityId: jinjaCity.id, description: 'Primary hub for Jinja City.', address: 'Main St, Jinja' },
    { name: 'Kabale Central Market', uniqueCode: 'KCM-003', cityId: kabaleCity.id, description: 'Economic heartbeat of Kabale.', address: 'Kabale Rd, Kabale' },
    { name: 'Mbarara Marketplace', uniqueCode: 'MMC-004', cityId: mbararaCity.id, description: 'Principal commerce hub in Mbarara.', address: 'High St, Mbarara' }
  ];

  const marketMap = {};
  for (const m of markets) {
    const market = await prisma.market.upsert({
      where: { uniqueCode: m.uniqueCode },
      update: {},
      create: {
        name: m.name,
        uniqueCode: m.uniqueCode,
        cityId: m.cityId,
        description: m.description,
        address: m.address
      }
    });
    marketMap[m.name] = market;
  }

  // 4. Processing Markets
  await processJinja(marketMap['Jinja Central Market'], systemAdmin, systemMember);
  await processStandardMarket(marketMap['Kabale Central Market'], 'Kabale Central Market FTS.xlsx', systemAdmin, systemMember);
  await processStandardMarket(marketMap['Mbarara Marketplace'], 'Mbarrara Marketplace.xlsx', systemAdmin, systemMember, true);

  console.log('--- Seeding Completed ---');
}

async function processJinja(market, admin, member) {
  console.log(`Processing ${market.name}...`);
  const level = await prisma.marketLevel.upsert({
    where: { marketId_levelNumber: { marketId: market.id, levelNumber: 1 } },
    update: {},
    create: {
      marketId: market.id,
      levelNumber: 1,
      uniqueCode: `${market.uniqueCode}-L1`,
      name: 'Main Floor',
      createdById: admin.id
    }
  });

  const registerPath = path.join(DATA_DIR, 'Jinja Market Register.xlsx');
  const workbook = XLSX.readFile(registerPath);

  for (const sheetName of workbook.SheetNames) {
    const nameHash = crypto.createHash('md5').update(sheetName).digest('hex').slice(0, 4);
    const sectionCode = `${market.uniqueCode}-${sheetName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}-${nameHash}`.slice(0, 50);

    const section = await prisma.marketSection.upsert({
      where: { 
        marketId_levelId_name: { 
          marketId: market.id, 
          levelId: level.id, 
          name: sheetName 
        } 
      },
      update: {},
      create: {
        marketId: market.id,
        levelId: level.id,
        uniqueCode: sectionCode,
        name: sheetName,
        sectionType: sheetName.includes('LOCKUP') ? 'SHOP_ZONE' : 'STALL_ZONE',
        createdById: admin.id
      }
    });



    const shopNumber = `S-${section.uniqueCode}`.slice(0, 20);
    const shop = await prisma.shop.upsert({
      where: { marketId_shopNumber: { marketId: market.id, shopNumber } },
      update: {},
      create: {
        marketId: market.id,
        sectionId: section.id,
        levelId: level.id,
        uniqueCode: `SHOP-${section.uniqueCode}`.slice(0, 50),
        shopNumber,
        shopName: `${sheetName} Container`.slice(0, 200),
        monthlyRent: 0,
        memberId: member.id,
        createdById: admin.id,
        contractStartDate: new Date(),
        contractEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 10))
      }
    });


    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    for (const row of rows.slice(0, 10)) { // Limit for initial seed
      const name = row['NAME'] || row['CURRENT VENDOR'] || 'Unknown Vendor';
      const phone = String(row['PHONE NO.'] || row['CONTACT'] || row['TELL'] || '').replace(/\s/g, '');
      const stallNo = row['FACILITY NO.'] || row['FACILITY NO'] || 'Unknown';
      
      if (name === 'Unknown Vendor' || name === 'VACANT') continue;

      await createVendorAsset(market, section, shop, admin, name, phone, stallNo, 150000);
    }
  }
}

async function processStandardMarket(market, fileName, admin, member, isMbarara = false) {
  console.log(`Processing ${market.name}...`);
  const level = await prisma.marketLevel.upsert({
    where: { marketId_levelNumber: { marketId: market.id, levelNumber: 1 } },
    update: {},
    create: {
      marketId: market.id,
      levelNumber: 1,
      uniqueCode: `${market.uniqueCode}-L1`,
      name: 'Ground Floor',
      createdById: admin.id
    }
  });

  const filePath = path.join(DATA_DIR, fileName);
  const workbook = XLSX.readFile(filePath);
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], isMbarara ? { range: 2 } : {});

  const categories = [...new Set(rows.map(r => r['category'] || r['CATEGORY'] || 'General'))];
  
  for (const cat of categories) {
    const nameHash = crypto.createHash('md5').update(cat).digest('hex').slice(0, 4);
    const sectionCode = `${market.uniqueCode}-${cat.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}-${nameHash}`.slice(0, 50);

    const section = await prisma.marketSection.upsert({
      where: { 
        marketId_levelId_name: { 
          marketId: market.id, 
          levelId: level.id, 
          name: cat 
        } 
      },
      update: {},
      create: {
        marketId: market.id,
        levelId: level.id,
        uniqueCode: sectionCode,
        name: cat,
        sectionType: 'COMMERCIAL',
        createdById: admin.id
      }
    });



    const shopNumber = `S-${section.uniqueCode}`.slice(0, 20);
    const shop = await prisma.shop.upsert({
      where: { marketId_shopNumber: { marketId: market.id, shopNumber } },
      update: {},
      create: {
        marketId: market.id,
        sectionId: section.id,
        levelId: level.id,
        uniqueCode: `SHOP-${section.uniqueCode}`.slice(0, 50),
        shopNumber,
        shopName: `${cat} Container`.slice(0, 200),
        monthlyRent: 0,
        memberId: member.id,
        createdById: admin.id,
        contractStartDate: new Date(),
        contractEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 10))
      }
    });


    const catRows = rows.filter(r => (r['category'] || r['CATEGORY'] || 'General') === cat);
    for (const row of catRows.slice(0, 10)) {
      let name = row['name'] || row['NAME.'] || 'Unknown';
      let phone = String(row['phone_no'] || row['mobile_number'] || '').replace(/\s/g, '');
      let stallNo = row['fc_no'] || row['FC NO.'] || 'Unknown';
      let rawRent = row['mth_pay'] || row["MTH PAY.(000'S)"] || 0;
      let rent = Number(rawRent);
      if (isNaN(rent)) rent = 0;
      if (isMbarara) rent *= 1000;

      await createVendorAsset(market, section, shop, admin, name, phone, stallNo, rent);

    }
  }
}

async function createVendorAsset(market, section, shop, admin, name, phone, stallNo, rent) {
  let basePhone = phone.length > 5 ? (phone.startsWith('256') ? `+${phone}` : `+256${phone}`) : `+256000${Math.floor(Math.random()*1000000)}`;
  let email = `vendor.${Math.random().toString(36).substr(2, 9)}@marketmaster.ug`;
  let safePhone = basePhone;
  let user = null;
  let attempts = 0;

  while (attempts < 5) {
    user = await prisma.user.create({
      data: {
        email,
        passwordHash: 'placeholder',
        phone: safePhone,
        profile: { 
          create: { 
            firstName: name.split(' ')[0].slice(0, 100), 
            lastName: (name.split(' ').slice(1).join(' ') || 'Vendor').slice(0, 100),
            primaryPhone: safePhone,
            primaryEmail: email
          } 
        }
      }
    }).catch(async (e) => {
      if (e.code === 'P2002' && e.meta?.target?.includes('phone')) {
        attempts++;
        safePhone = `${basePhone}-${attempts}`;
        return null;
      }
      console.error(`Failed to create user ${email}:`, e.message);
      return null;
    });

    if (user) break;
    if (attempts >= 5) {
      console.error(`Aborting user creation for ${name} after 5 phone collision attempts.`);
      return;
    }
  }

  if (!user) return;

  const stakeholder = await prisma.stakeholder.create({
    data: { userId: user.id, stakeholderType: 'VENDOR' }
  });

  const vendor = await prisma.vendor.create({
    data: {
      stakeholderId: stakeholder.id,
      vendorCode: `V-${market.uniqueCode}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      businessName: `${name}'s Business`,
      primaryMarketId: market.id
    }
  });

  await prisma.stall.upsert({
    where: { 
      shopId_stallNumber: { 
        shopId: shop.id, 
        stallNumber: String(stallNo).slice(0, 20) 
      } 
    },
    update: {},
    create: {
      marketId: market.id,
      sectionId: section.id,
      shopId: shop.id,
      vendorId: vendor.id,
      uniqueCode: `STALL-${market.uniqueCode}-${stallNo}-${Math.floor(Math.random()*1000)}`.slice(0, 50),
      stallNumber: String(stallNo).slice(0, 20),
      stallType: 'PERMANENT',
      category: section.name.slice(0, 100),
      dailyRate: (rent / 30).toFixed(2),
      monthlyRate: rent,
      contractStartDate: new Date(),
      createdById: admin.id
    }
  });


}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
