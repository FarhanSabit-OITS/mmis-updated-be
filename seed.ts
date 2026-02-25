import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding started...\n');

  try {
    // Use upsert for all data to avoid conflicts and unnecessary deletions
    console.log('🔄 Upserting seed data...');

    // Create Basic Structure
    console.log('\n🌍 Creating geolocation structure...');

    const geo = await prisma.geolocation.upsert({
      where: { code: 'UG' },
      update: {},
      create: {
        id: 'g1',
        name: 'Uganda',
        code: 'UG',
      }
    });

    const district = await prisma.district.upsert({
      where: { code: 'KLA-DIST' },
      update: {},
      create: {
        id: 'd1',
        geolocationId: geo.id,
        name: 'Kampala District',
        code: 'KLA-DIST',
      }
    });

    const city = await prisma.city.upsert({
      where: { code: 'KLA' },
      update: {},
      create: {
        id: 'c1',
        districtId: district.id,
        name: 'Kampala',
        code: 'KLA'
      }
    });

    console.log('\n🏪 Creating markets matching frontend constants...');

    await prisma.market.upsert({
      where: { uniqueCode: 'NAK-001' },
      update: {},
      create: {
        id: 'm1',
        cityId: city.id,
        name: 'Nakasero Market',
        uniqueCode: 'NAK-001',
        address: 'Nakasero, Kampala',
        marketType: 'PERMANENT'
      }
    });

    await prisma.market.upsert({
      where: { uniqueCode: 'OWI-001' },
      update: {},
      create: {
        id: 'm2',
        cityId: city.id,
        name: 'Owino Market',
        uniqueCode: 'OWI-001',
        address: 'Downtown Kampala',
        marketType: 'PERMANENT'
      }
    });

    // Create Roles
    console.log('\n🔐 Creating roles...');

    // Create Roles
    console.log('\n🔐 Ensuring roles exist...');

    const guestRole = await prisma.role.upsert({
      where: { name: 'Guest' },
      update: {},
      create: {
        name: 'Guest',
        description: 'New registered user',
        level: null,
      },
    });
    console.log(`✅ Role checked: Guest`);

    const superAdminRole = await prisma.role.upsert({
      where: { name: 'SuperAdmin' },
      update: { level: 'SUPER_ADMIN' },
      create: {
        name: 'SuperAdmin',
        description: 'System-wide administrator',
        level: 'SUPER_ADMIN',
      },
    });
    console.log(`✅ Role checked: SuperAdmin`);

    const marketMasterRole = await prisma.role.upsert({
      where: { name: 'MarketMaster' },
      update: { level: 'MARKET_MASTER' },
      create: {
        name: 'MarketMaster',
        description: 'Manages a specific market',
        level: 'MARKET_MASTER',
      },
    });
    console.log(`✅ Role checked: MarketMaster`);

    const gateCounterRole = await prisma.role.upsert({
      where: { name: 'GateCounter' },
      update: { level: 'PSEUDO_MARKET_ADMIN' },
      create: {
        name: 'GateCounter',
        description: 'Gate entry/exit management',
        level: 'PSEUDO_MARKET_ADMIN',
      },
    });
    console.log(`✅ Role checked: GateCounter`);

    const vendorRole = await prisma.role.upsert({
      where: { name: 'Vendor' },
      update: {},
      create: {
        name: 'Vendor',
        description: 'Market vendor / shop owner',
        level: null,
      },
    });
    console.log(`✅ Role checked: Vendor`);

    const supplierRole = await prisma.role.upsert({
      where: { name: 'Supplier' },
      update: {},
      create: {
        name: 'Supplier',
        description: 'Goods supplier',
        level: null,
      },
    });
    console.log(`✅ Role checked: Supplier`);

    // Create Users
    console.log('\n👤 Creating users...');

    // Create Users
    console.log('\n👤 Ensuring users exist and have correct roles...');

    const superAdminPassword = await hash('superadmin123', 10);
    await prisma.user.upsert({
      where: { email: 'superadmin@marketmaster.com' },
      update: {
        passwordHash: superAdminPassword,
        status: 'ACTIVE',
        emailVerified: true,
        userRoles: {
          deleteMany: {},
          create: {
            roleId: superAdminRole.id
          }
        }
      },
      create: {
        email: 'superadmin@marketmaster.com',
        passwordHash: superAdminPassword,
        status: 'ACTIVE',
        emailVerified: true,
        userRoles: {
          create: {
            roleId: superAdminRole.id
          }
        }
      },
    });
    console.log('✅ User: superadmin@marketmaster.com [SuperAdmin]');

    const legacySuperAdminPassword = await hash('superadmin1234', 10);
    await prisma.user.upsert({
      where: { email: 'superadmin@super.com' },
      update: {
        passwordHash: legacySuperAdminPassword,
        status: 'ACTIVE',
        emailVerified: true,
        userRoles: {
          deleteMany: {},
          create: {
            roleId: superAdminRole.id
          }
        }
      },
      create: {
        email: 'superadmin@super.com',
        passwordHash: legacySuperAdminPassword,
        status: 'ACTIVE',
        emailVerified: true,
        userRoles: {
          create: {
            roleId: superAdminRole.id
          }
        }
      },
    });
    console.log('✅ User: superadmin@super.com [SuperAdmin]');

    const marketMasterPassword = await hash('market123', 10);
    const m1User = await prisma.user.upsert({
      where: { email: 'nakasero.manager@marketmaster.com' },
      update: {
        passwordHash: marketMasterPassword,
        status: 'ACTIVE',
        emailVerified: true,
        userRoles: {
          deleteMany: {},
          create: {
            roleId: marketMasterRole.id
          }
        }
      },
      create: {
        email: 'nakasero.manager@marketmaster.com',
        passwordHash: marketMasterPassword,
        status: 'ACTIVE',
        emailVerified: true,
        userRoles: {
          create: {
            roleId: marketMasterRole.id
          }
        }
      },
    });
    console.log('✅ User: nakasero.manager@marketmaster.com [MarketMaster]');

    // Create Admin and MarketMaster records for manager
    const m1Admin = await prisma.admin.upsert({
      where: { userId: m1User.id },
      update: { adminLevel: 'MARKET_MASTER' },
      create: {
        userId: m1User.id,
        adminLevel: 'MARKET_MASTER',
      }
    });

    await prisma.marketMaster.upsert({
      where: { adminId: m1Admin.id },
      update: { marketId: 'm1' },
      create: {
        adminId: m1Admin.id,
        marketId: 'm1',
      }
    });
    console.log('✅ MarketMaster record for Nakasero Market linked to manager@marketmaster.com');

    // Create a second manager for Owino
    const m2User = await prisma.user.upsert({
      where: { email: 'owino.manager@marketmaster.com' },
      update: {
        passwordHash: marketMasterPassword,
        status: 'ACTIVE',
        emailVerified: true,
        userRoles: {
          deleteMany: {},
          create: {
            roleId: marketMasterRole.id
          }
        }
      },
      create: {
        email: 'owino.manager@marketmaster.com',
        passwordHash: marketMasterPassword,
        status: 'ACTIVE',
        emailVerified: true,
        userRoles: {
          create: {
            roleId: marketMasterRole.id
          }
        }
      },
    });

    const m2Admin = await prisma.admin.upsert({
      where: { userId: m2User.id },
      update: { adminLevel: 'MARKET_MASTER' },
      create: {
        userId: m2User.id,
        adminLevel: 'MARKET_MASTER',
      }
    });

    await prisma.marketMaster.upsert({
      where: { adminId: m2Admin.id },
      update: { marketId: 'm2' },
      create: {
        adminId: m2Admin.id,
        marketId: 'm2',
      }
    });
    console.log('✅ User: owino.manager@marketmaster.com [MarketMaster] linked to Owino Market');

    const gateCounterPassword = await hash('gate123', 10);
    await prisma.user.upsert({
      where: { email: 'gate@marketmaster.com' },
      update: {
        passwordHash: gateCounterPassword,
        status: 'ACTIVE',
        emailVerified: true,
        userRoles: {
          deleteMany: {},
          create: {
            roleId: gateCounterRole.id
          }
        }
      },
      create: {
        email: 'gate@marketmaster.com',
        passwordHash: gateCounterPassword,
        status: 'ACTIVE',
        emailVerified: true,
        userRoles: {
          create: {
            roleId: gateCounterRole.id
          }
        }
      },
    });
    console.log('✅ User: gate@marketmaster.com [GateCounter]');

    console.log('\n✨ Database seeded successfully!');
    console.log('─'.repeat(50));
    console.log('Available test users:');
    console.log('  1. superadmin@marketmaster.com / superadmin123 (SuperAdmin)');
    console.log('  2. superadmin@super.com / superadmin1234 (SuperAdmin)');
    console.log('  3. nakasero.manager@marketmaster.com / market123 (Nakasero Market Master)');
    console.log('  4. owino.manager@marketmaster.com / market123 (Owino Market Master)');
    console.log('  5. gate@marketmaster.com / gate123 (GateCounter)');
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
