import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding started...\n');

  try {
    // Clean existing data
    console.log('🗑️  Clearing previous data...');
    try {
      await prisma.$executeRawUnsafe(`DELETE FROM role_permissions`);
      await prisma.$executeRawUnsafe(`DELETE FROM roles`);
      console.log('✅ Cleared roles and permissions');
    } catch (e) {
      console.log('ℹ️  Note:', (e as any).message);
    }
    
    try {
      await prisma.$executeRawUnsafe(`DELETE FROM user_roles`);
      await prisma.$executeRawUnsafe(`DELETE FROM user_profiles`);
      await prisma.$executeRawUnsafe(`DELETE FROM users WHERE email LIKE '%@marketmaster.com'`);
      console.log('✅ Cleared test users');
    } catch (e) {
      console.log('ℹ️  Note:', (e as any).message);
    }

    // Create Roles
    console.log('\n🔐 Creating roles...');

    const guestRole = await prisma.role.create({
      data: {
        name: 'Guest',
        description: 'New registered user',
        level: null,
      },
    });
    console.log(`✅ Role created: Guest`);

    const superAdminRole = await prisma.role.create({
      data: {
        name: 'SuperAdmin',
        description: 'System-wide administrator',
        level: 'SUPER_ADMIN',
      },
    });
    console.log(`✅ Role created: SuperAdmin`);

    const marketMasterRole = await prisma.role.create({
      data: {
        name: 'MarketMaster',
        description: 'Manages a specific market',
        level: 'MARKET_MASTER',
      },
    });
    console.log(`✅ Role created: MarketMaster`);

    const gateCounterRole = await prisma.role.create({
      data: {
        name: 'GateCounter',
        description: 'Gate entry/exit management',
        level: 'PSEUDO_MARKET_ADMIN',
      },
    });
    console.log(`✅ Role created: GateCounter`);

    // Create Users
    console.log('\n👤 Creating users...');

    const superAdminPassword = await hash('superadmin123', 10);
    const superAdminUser = await prisma.user.create({
      data: {
        email: 'superadmin@marketmaster.com',
        passwordHash: superAdminPassword,
      },
    });
    console.log(
      '✅ User: superadmin@marketmaster.com (Password: superadmin123)'
    );

    const marketMasterPassword = await hash('market123', 10);
    const marketMasterUser = await prisma.user.create({
      data: {
        email: 'manager@marketmaster.com',
        passwordHash: marketMasterPassword,
      },
    });
    console.log(
      '✅ User: manager@marketmaster.com (Password: market123)'
    );

    const gateCounterPassword = await hash('gate123', 10);
    const gateCounterUser = await prisma.user.create({
      data: {
        email: 'gate@marketmaster.com',
        passwordHash: gateCounterPassword,
      },
    });
    console.log(
      '✅ User: gate@marketmaster.com (Password: gate123)'
    );

    console.log('\n✨ Database seeded successfully!');
    console.log('─'.repeat(50));
    console.log('Available test users:');
    console.log('  1. superadmin@marketmaster.com / superadmin123');
    console.log('  2. manager@marketmaster.com / market123');
    console.log('  3. gate@marketmaster.com / gate123');
    console.log('─'.repeat(50));
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('❌ Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
