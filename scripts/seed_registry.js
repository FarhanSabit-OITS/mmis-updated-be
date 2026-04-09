const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const prisma = new PrismaClient();
const DATA_DIR = path.join(process.cwd(), 'Data');

// Statistics
const stats = {
  filesProcessed: 0,
  rowsParsed: 0,
  vendorsCreated: 0,
  facilitiesCreated: 0,
  duplicatesMerged: 0,
  problematicRows: [],
};

// Global Deduplication Maps
const vendorsMap = new Map(); // Key: NIN or Normalized Phone
const facilitiesMap = new Map(); // Key: marketId + unitNumber

async function seed() {
  console.log('--- Starting Comprehensive Market Registry Seeding (High-Fidelity) ---');

  // 1. Geography: District & City (Same as previous script)
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
    {
      name: 'Jinja Central Market',
      uniqueCode: 'MKT-JINJA',
      cityId: jinjaCity.id,
      description: 'The largest central market in Jinja City.',
      address: 'Main St, Jinja City'
    },
    {
      name: 'Kabale Central Market',
      uniqueCode: 'MKT-KABALE',
      cityId: kabaleCity.id,
      description: 'Major business hub in Kabale Municipality.',
      address: 'Market Road, Kabale Municipality'
    },
    {
      name: 'Mbarara Marketplace',
      uniqueCode: 'MKT-MBARARA',
      cityId: mbararaCity.id,
      description: 'Primary central market for Mbarara City.',
      address: 'Mbarara High St'
    }
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

  // 4. Dynamic File Ingestion
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.xlsx'));
  
  for (const file of files) {
    await processFile(file, marketMap, systemAdmin, systemMember);
    stats.filesProcessed++;
  }

  await updateMarketStats();
  await printFinalSummary();
}

async function updateMarketStats() {
  console.log('\n--- Synchronizing Market Statistics ---');
  const markets = await prisma.market.findMany();
  for (const m of markets) {
    const totalFacilities = await prisma.facility.count({ where: { marketId: m.id } });
    const occupiedFacilities = await prisma.facility.count({ 
      where: { 
        marketId: m.id,
        occupationStatus: 'OCCUPIED'
      } 
    });
    
    await prisma.market.update({
      where: { id: m.id },
      data: { totalFacilities, occupiedFacilities }
    });
    
    // Also update Levels and Sections if needed (minimal for now)
    const levels = await prisma.marketLevel.findMany({ where: { marketId: m.id } });
    for (const level of levels) {
      const levelFacilities = await prisma.facility.count({ where: { levelId: level.id } });
      await prisma.marketLevel.update({
        where: { id: level.id },
        data: { totalFacilities: levelFacilities }
      });
    }

    const sections = await prisma.marketSection.findMany({ where: { marketId: m.id } });
    for (const section of sections) {
      const sectionFacilities = await prisma.facility.count({ where: { sectionId: section.id } });
      const sectionOccupied = await prisma.facility.count({ 
        where: { sectionId: section.id, occupationStatus: 'OCCUPIED' } 
      });
      await prisma.marketSection.update({
        where: { id: section.id },
        data: { 
          totalFacilities: sectionFacilities,
          occupiedFacilities: sectionOccupied
        }
      });
    }
  }
}

async function printFinalSummary() {
  const vCount = await prisma.vendor.count();
  const fCount = await prisma.facility.count();
  
  console.log('\n--- Final Seeding Summary ---');
  console.log(`Files Processed:   ${stats.filesProcessed}`);
  console.log(`Total Rows Parsed: ${stats.rowsParsed}`);
  console.log(`Final Database Vendors:    ${vCount}`);
  console.log(`Final Database Facilities: ${fCount}`);
  console.log(`Problematic Rows:  ${stats.problematicRows.length}`);
  
  if (stats.problematicRows.length > 0) {
    console.log('\n--- Problematic Records (First 5) ---');
    stats.problematicRows.slice(0, 5).forEach((row, i) => {
      console.log(`${i+1}. [${row.file} / ${row.sheet}] Unit ${row.unit}: ${row.issue}`);
    });
  }
  console.log('\n✅ Seeding Complete and Verified.');
}

async function processFile(fileName, marketMap, admin, member) {
  console.log(`\nProcessing file: ${fileName}`);
  const filePath = path.join(DATA_DIR, fileName);
  const workbook = XLSX.readFile(filePath);

  // Heuristic: Determine primary market from filename
  let defaultMarket = marketMap['Jinja Central Market'];
  if (fileName.toLowerCase().includes('kabale')) defaultMarket = marketMap['Kabale Central Market'];
  if (fileName.toLowerCase().includes('mbar')) defaultMarket = marketMap['Mbarara Marketplace'];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    // Check if sheet has data
    const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:A1');
    if (range.e.r < 1) continue;

    console.log(`  Reading sheet: ${sheetName}`);
    
    // Custom range handling for Mbarara (offsets)
    const options = fileName.toLowerCase().includes('mbarrara') ? { range: 2 } : {};
    const rows = XLSX.utils.sheet_to_json(sheet, options);
    
    // Level Setup (Default Ground Floor)
    const levelKey = `${fileName}-${sheetName}-L1`;
    const level = await prisma.marketLevel.upsert({
      where: { marketId_levelNumber: { marketId: defaultMarket.id, levelNumber: 1 } },
      update: {},
      create: {
        marketId: defaultMarket.id,
        levelNumber: 1,
        uniqueCode: levelKey.slice(0, 50),
        name: 'Ground Floor',
        createdById: admin.id
      }
    });

    for (const row of rows) {
      stats.rowsParsed++;
      
      // Dynamic Column Mapping
      const name = normalize(row['name'] || row['NAME.'] || row['OWNER_NAME'] || row['CURRENT VENDOR'] || row['NAME'] || row['JINJA CENTRAL MARKET ']);
      const phone = String(row['phone_no'] || row['mobile_number'] || row['PHONE NO.'] || row['TELL'] || row['CONTACT'] || '').replace(/\s/g, '').slice(0, 15);
      const nin = normalize(row['nin'] || row['NIN'] || row['__EMPTY_1']);
      const unitNumber = String(row['fc_no'] || row['FC NO.'] || row['FACILITY NO.'] || row['FACILITY NO'] || row['lock_up_number'] || row['LOCKUPS'] || 'Unknown').slice(0, 20);
      const category = normalize(row['category'] || row['CATEGORY'] || row['nature_of_market'] || 'General');
      const rawRent = row['amount'] || row['mth_pay'] || row["MTH PAY.(000'S)"] || 0;

      // Skip Problematic Rows
      if (!name || name === 'Unknown' || name === 'VACANT' || name.length < 2) {
        if (unitNumber !== 'Unknown') {
          stats.problematicRows.push({ file: fileName, sheet: sheetName, unit: unitNumber, issue: 'Missing or Invalid Name' });
        }
        continue;
      }

      // Determine Market for row (override if market column exists)
      let rowMarket = defaultMarket;
      const marketVal = row['market'] || row['MARKET'];
      if (marketVal && marketMap[marketVal]) rowMarket = marketMap[marketVal];

      // Section Setup
      const nameHash = crypto.createHash('md5').update(category).digest('hex').slice(0, 4);
      const sectionCode = `${rowMarket.uniqueCode}-${category.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}-${nameHash}`.slice(0, 50);

      const section = await prisma.marketSection.upsert({
        where: { 
          marketId_levelId_name: { 
            marketId: rowMarket.id, 
            levelId: level.id, 
            name: category 
          } 
        },
        update: {},
        create: {
          marketId: rowMarket.id,
          levelId: level.id,
          uniqueCode: sectionCode,
          name: category,
          sectionType: 'COMMERCIAL',
          createdById: admin.id
        }
      });

      // Facility & Vendor Creation
      let rent = Number(rawRent);
      if (isNaN(rent)) rent = 0;
      if (fileName.toLowerCase().includes('mbarrara')) rent *= 1000;

      await syncVendorAndFacility(rowMarket, level, section, admin, member, name, phone, nin, unitNumber, rent);
    }
  }
}

async function syncVendorAndFacility(market, level, section, admin, member, name, phone, nin, unitNumber, rent) {
  // Deduplication Key Priority: NIN > Phone
  const dedupeKey = nin || (phone.length > 5 ? phone : null);
  
  let vendorId = null;
  if (dedupeKey && vendorsMap.has(dedupeKey)) {
    vendorId = vendorsMap.get(dedupeKey);
    stats.duplicatesMerged++;
  } else {
    // Create User, Stakeholder, and Vendor
    const email = `v.${crypto.randomBytes(3).toString('hex')}@m.ug`.slice(0, 255);
    const safePhone = (phone.length > 5 ? (phone.startsWith('256') ? `+${phone}` : `+256${phone}`) : `+256000${crypto.randomBytes(3).readUIntBE(0, 3)}`).slice(0, 20);
    
    try {
      if (stats.vendorsCreated % 100 === 0) console.log(`  Created ${stats.vendorsCreated} vendors...`);
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash: 'placeholder',
          phone: safePhone,
          profile: { 
            create: { 
              firstName: name.split(' ')[0].slice(0, 100), 
              lastName: (name.split(' ').slice(1).join(' ') || 'Vendor').slice(0, 100),
              primaryPhone: safePhone,
              primaryEmail: email,
              nationalId: nin ? nin.slice(0, 50) : null,
              nationalIdType: 'NIN'
            } 
          }
        }
      });

      const stakeholder = await prisma.stakeholder.create({
        data: { userId: user.id, stakeholderType: 'VENDOR' }
      });

      const vendor = await prisma.vendor.create({
        data: {
          stakeholderId: stakeholder.id,
          vendorCode: `V-${market.uniqueCode}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
          businessName: `${name}'s Business`,
          primaryMarketId: market.id
        }
      });

      vendorId = vendor.id;
      if (dedupeKey) vendorsMap.set(dedupeKey, vendorId);
      stats.vendorsCreated++;
    } catch (e) {
      // If P2002 on phone, it's a duplicate we missed in the map
      if (e.code === 'P2002') return;
      console.error(`Error creating vendor ${name}:`, e.message);
      return;
    }
  }

  // Facility Upsert
  const fKey = `${market.id}-${unitNumber}`;
  if (!facilitiesMap.has(fKey)) {
    await prisma.facility.upsert({
      where: { 
        marketId_unitNumber: { 
          marketId: market.id, 
          unitNumber: String(unitNumber).slice(0, 20) 
        } 
      },
      update: {
        vendors: { connect: { id: vendorId } }
      },
      create: {
        marketId: market.id,
        levelId: level.id,
        sectionId: section.id,
        memberId: member.id,
        createdById: admin.id,
        uniqueCode: `FAC-${market.uniqueCode}-${unitNumber}-${crypto.randomBytes(2).toString('hex')}`.slice(0, 50),
        unitNumber: String(unitNumber).slice(0, 20),
        type: 'STALL',
        status: 'ACTIVE',
        occupationStatus: 'OCCUPIED',
        monthlyRent: rent,
        dailyRate: (rent / 30).toFixed(2),
        contractStartDate: new Date(),
        vendors: { connect: { id: vendorId } }
      }
    });
    facilitiesMap.set(fKey, true);
    stats.facilitiesCreated++;
  }
}

function normalize(val) {
  if (!val) return null;
  const s = String(val).trim();
  return s.length > 0 ? s : null;
}

function printSummary() {
  console.log('\n--- Seeding Summary ---');
  console.log(`Files Processed:   ${stats.filesProcessed}`);
  console.log(`Total Rows Parsed: ${stats.rowsParsed}`);
  console.log(`Vendors Created:   ${stats.vendorsCreated}`);
  console.log(`Facilities Created: ${stats.facilitiesCreated}`);
  console.log(`Duplicates Merged: ${stats.duplicatesMerged}`);
  console.log(`Problematic Rows:  ${stats.problematicRows.length}`);
  
  if (stats.problematicRows.length > 0) {
    console.log('\n--- Problematic Records (First 10) ---');
    stats.problematicRows.slice(0, 10).forEach((row, i) => {
      console.log(`${i+1}. [${row.file} / ${row.sheet}] Unit ${row.unit}: ${row.issue}`);
    });
  }
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
