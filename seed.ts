import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding started...');

  //  Clean  existing data (respect FK order)
  await prisma.vendorProfile.deleteMany();
  await prisma.supplierProfile.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.marketAssignment.deleteMany();
  await prisma.invitationLink.deleteMany();
  await prisma.userSession.deleteMany();
  await prisma.userTOTP.deleteMany();
  await prisma.kycDocument.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.market.deleteMany();
  await prisma.city.deleteMany();
  await prisma.district.deleteMany();

  console.log('Cleared previous data.');

  // Roles
  const superAdminRole = await prisma.role.create({
    data: { name: 'SuperAdmin', level: 1, description: 'System-wide administrator with all permissions.' },
  });
  const marketMasterRole = await prisma.role.create({
    data: { name: 'MarketMaster', level: 2, description: 'Manages a specific market.' },
  });
  const gateCounterRole = await prisma.role.create({
    data: { name: 'GateCounter', level: 3, description: 'Manages gate entries and exits.' },
  });
  const vendorRole = await prisma.role.create({
    data: { name: 'Vendor', level: 4, description: 'A vendor operating within a market.' },
  });
  console.log('Roles seeded.');

  //  Permissions (example baseline)
  const permissionsData = [
    // User Management
    { code: 'UM_CREATE', moduleName: 'UserManagement', operation: 'CREATE', description: 'Can create new users' },
    { code: 'UM_READ', moduleName: 'UserManagement', operation: 'READ', description: 'Can view users' },
    { code: 'UM_UPDATE', moduleName: 'UserManagement', operation: 'UPDATE', description: 'Can update user details' },
    { code: 'UM_DELETE', moduleName: 'UserManagement', operation: 'DELETE', description: 'Can delete users' },

    // Market Management
    { code: 'MM_MANAGE', moduleName: 'MarketManagement', operation: 'MANAGE', description: 'Can manage market settings' },

    // Revenue
    { code: 'RM_VIEW', moduleName: 'Revenue', operation: 'VIEW', description: 'Can view revenue reports' },
  ];
  const permissions = await Promise.all(permissionsData.map(p => prisma.permission.create({ data: p })));
  console.log('Permissions seeded.');

  // Role–Permission assignments
  await Promise.all(
    permissions.map(p =>
      prisma.rolePermission.create({ data: { roleId: superAdminRole.id, permissionId: p.id } }),
    ),
  );

  const marketMasterPermissions = permissions.filter(p =>
    ['UM_READ', 'UM_UPDATE', 'MM_MANAGE', 'RM_VIEW'].includes(p.code),
  );
  await Promise.all(
    marketMasterPermissions.map(p =>
      prisma.rolePermission.create({ data: { roleId: marketMasterRole.id, permissionId: p.id } }),
    ),
  );
  console.log('Role-permission assignments seeded.');

  // Districts, Cities, Markets
  // NOTE: Prisma will generate UUIDs automatically - do NOT set explicit IDs
  const defaultDistrict = await prisma.district.create({
    data: { name: 'Default District', code: 'D001' },
  });
  console.log('Default district created.');

  // Cities (taken from legacy)
  const city1 = await prisma.city.create({
    data: { name: 'Mbarara', code: 'MBA', districtId: defaultDistrict.id },
  });
  const city2 = await prisma.city.create({
    data: { name: 'Borishal', code: 'BOR', districtId: defaultDistrict.id },
  });
  const city3 = await prisma.city.create({
    data: { name: 'Comilla', code: 'COM', districtId: defaultDistrict.id },
  });
  console.log('Cities seeded.');

  // Markets (taken from legacy)
  const market1 = await prisma.market.create({
    data: { name: 'Mbarara', code: 'MKT01', type: 'GOVERNMENT', cityId: city1.id },
  });
  const market2 = await prisma.market.create({
    data: { name: 'Jinja', code: 'MKT02', type: 'PRIVATE', cityId: city1.id },
  });
  const market3 = await prisma.market.create({
    data: { name: 'Kabale', code: 'MKT03', type: 'PPP', cityId: city1.id },
  });
  console.log('Markets seeded.');

  // Users (create a super admin)
  const superAdminPassword = await hash('superadmin123', 10);
  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@marketmaster.com',
      firstName: 'Super',
      lastName: 'Admin',
      passwordHash: superAdminPassword,
      roleId: superAdminRole.id,
      isActive: true,
      isVerified: true,
    },
  });
  console.log('SuperAdmin user created. Email: superadmin@marketmaster.com, Password: superadmin123');

  // Migrate a few legacy users (sample rows mirrored from dump)
  const oldUsers = [
    {
      firstName: 'Md. Tanvir Ahmed',
      lastName: 'Siddiqee',
      email: 'tanvirahmedsiddiqee@gmail.com',
      phone: '01716532401',
      role: 'admin',
      password: '$2a$10$5qKoVgKWUH.kXB.gzUrv8eHDnkJXrdQalUbuhKErJYE6YJr1EAuoa',
      marketId: market1.id,
    },
    {
      firstName: 'Makeda',
      lastName: 'Kirungikwera',
      email: 'cesasub@mailinator.com',
      phone: '+1 (522) 986-98',
      role: 'admin',
      password: '$2a$10$EANVhHEIiYWagRQgJ7DvfeyVDKnnbxGfkg3vfS275zZwFaxu5pJsy',
      marketId: market1.id,
    },
    {
      firstName: 'Solomon',
      lastName: 'Sampson',
      email: 'fazejeg@mailinator.com',
      phone: '0123456789',
      role: 'user',
      password: '$2a$10$Lzdtv2TkaNTFPtWu6zqG.OljN74YYBBVINn2mpVGq3EfTfSuCyq.S',
      marketId: market1.id,
    },
    {
      firstName: 'Md. Tanvir Ahmed',
      lastName: 'Siddiqee (2)',
      email: 'sam.tanvir18@gmai.com',
      phone: null,
      role: null, // treat as gate counter by default
      password: '$2a$10$dP27Bzvt2kWrDRFTeAD0mO4kOFAMT.zMwSdm.tRH6H1ZMqIL2HODK',
      marketId: market1.id,
    },
  ];

  for (const oldUser of oldUsers) {
    // Map legacy roles → new roleIds
    let roleIdToAssign = gateCounterRole.id;
    if (oldUser.role === 'admin') roleIdToAssign = marketMasterRole.id;

    const user = await prisma.user.create({
      data: {
        email: oldUser.email,
        firstName: oldUser.firstName,
        lastName: oldUser.lastName,
        phone: oldUser.phone,
        passwordHash: oldUser.password, // legacy hash reused
        roleId: roleIdToAssign,
        isActive: true,
        isVerified: true,
      },
    });

    // Market assignment if present
    if (oldUser.marketId) {
      await prisma.marketAssignment.create({
        data: {
          userId: user.id,
          marketId: oldUser.marketId,
          assignedById: superAdmin.id, // assigned by super admin during migration
          canManageMarket: oldUser.role === 'admin',
          canManageVendors: oldUser.role === 'admin',
          canCollectRevenue: true,
        },
      });
    }
  }
  console.log(`${oldUsers.length} users migrated from old database.`);

  // Sample vendors from legacy "customer" (small demo set)
  const oldCustomers = [
    { name: 'NAMARA EDRAI', email: 'namara.edrai@vendor.com', category: 'TEXTILE', marketId: market1.id },
    { name: 'TUKAMUSIIMA MAURINE', email: 'tukamusiima.maurine@vendor.com', category: 'TEXTILE', marketId: market1.id },
    { name: 'BAMENYA MUHAMMAD', email: 'bamenya.muhammad@vendor.com', category: 'FF', marketId: market1.id },
  ];
  const vendorPassword = await hash('vendor123', 10);

  for (const cust of oldCustomers) {
    const parts = cust.name.split(' ');
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ') || 'Vendor';

    const vendorUser = await prisma.user.create({
      data: {
        email: cust.email,
        firstName,
        lastName,
        passwordHash: vendorPassword,
        roleId: vendorRole.id,
        isActive: true,
        isVerified: true,
      },
    });

    // Create vendor profile
    await prisma.vendorProfile.create({
      data: {
        userId: vendorUser.id,
        businessName: `${firstName}'s ${cust.category} Shop`,
        businessType: cust.category,
      },
    });

    // Create market assignment
    await prisma.marketAssignment.create({
      data: {
        userId: vendorUser.id,
        marketId: cust.marketId,
        assignedById: superAdmin.id,
        canManageMarket: false,
        canManageVendors: false,
        canCollectRevenue: false,
      },
    });

    console.log(`Created vendor: ${vendorUser.email}`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
