import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding started...\n');

  // Clean existing data (respecting FK constraints)
  console.log('Clearing previous data...');
  try {
    await prisma.rolePermission.deleteMany();
    await prisma.role.deleteMany();
    await prisma.market.deleteMany();
    await prisma.city.deleteMany();
    await prisma.district.deleteMany();
    await prisma.user.deleteMany();
  } catch (e) {
    console.log('Note: Some tables may not exist yet');
  }

  // Create Districts
  console.log('\nCreating geolocation...');
  const geolocation = await prisma.geolocation.create({
    data: {
      name: 'Uganda Region',
      code: 'UG-001',
    },
  });
  console.log(`Geolocation created: ${geolocation.name}`);

  console.log('\nCreating districts...');
  const district = await prisma.district.create({
    data: {
      name: 'Central District',
      code: 'CD001',
      geolocationId: geolocation.id,
    },
  });
  console.log(`District created: ${district.name}`);

  // Create Cities
  console.log('\nCreating cities...');
  const city = await prisma.city.create({
    data: {
      name: 'Main City',
      code: 'CITY01',
      districtId: district.id,
    },
  });
  console.log(`City created: ${city.name}`);

  // Create Markets
  console.log('\nCreating markets...');
  await prisma.market.create({
    data: {
      name: 'Central Market',
      uniqueCode: 'MKT-CENTRAL-001',
      address: '123 Market Street, Main City',
      cityId: city.id,
    },
  });
  console.log('Market created: Central Market');

  // Create Roles
  console.log('\nCreating roles...');
  const superAdminRole = await prisma.role.create({
    data: {
      name: 'SuperAdmin',
      description: 'System-wide administrator',
    },
  });

  const marketMasterRole = await prisma.role.create({
    data: {
      name: 'MarketMaster',
      description: 'Manages a specific market',
    },
  });

  const gateCounterRole = await prisma.role.create({
    data: {
      name: 'GateCounter',
      description: 'Gate entry/exit management',
    },
  });

  console.log('3 roles created');

  // Create Role-Permissions
  console.log('\nAssigning permissions...');
  await Promise.all([
    prisma.rolePermission.create({
      data: { roleId: superAdminRole.id, resource: 'USER', action: 'MANAGE' },
    }),
    prisma.rolePermission.create({
      data: { roleId: superAdminRole.id, resource: 'MARKET', action: 'MANAGE' },
    }),
    prisma.rolePermission.create({
      data: { roleId: marketMasterRole.id, resource: 'MARKET', action: 'READ' },
    }),
    prisma.rolePermission.create({
      data: { roleId: gateCounterRole.id, resource: 'GATE', action: 'MANAGE' },
    }),
  ]);
  console.log('Permissions assigned');

  // Create Users
  console.log('\nCreating users...');
  const superAdminPassword = await hash('superadmin123', 10);
  await prisma.user.create({
    data: {
      email: 'superadmin@marketmaster.com',
      passwordHash: superAdminPassword,
    },
  });
  console.log('User: superadmin@marketmaster.com (Password: superadmin123)');

  const marketMasterPassword = await hash('market123', 10);
  await prisma.user.create({
    data: {
      email: 'manager@marketmaster.com',
      passwordHash: marketMasterPassword,
    },
  });
  console.log('User: manager@marketmaster.com (Password: market123)');

  const gateCounterPassword = await hash('gate123', 10);
  await prisma.user.create({
    data: {
      email: 'gate@marketmaster.com',
      passwordHash: gateCounterPassword,
    },
  });
  console.log('User: gate@marketmaster.com (Password: gate123)');

  console.log('\nDatabase seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
