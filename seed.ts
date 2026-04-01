import { PrismaClient, Prisma } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding started...\n');

  try {
    console.log('🔄 Upserting seed data...');

    // 1. Geolocation Structure
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
        name: 'Kampala City',
        code: 'KLA'
      }
    });

    // 2. Universal Category Framework (UCF)
    console.log('\n🌿 Creating Universal Category Framework (UCF)...');

    // Level 1: Sectors
    const agriculture = await prisma.category.upsert({
      where: { slug: 'agriculture' },
      update: {},
      create: {
        id: 'cat-agri',
        name: 'Agriculture',
        slug: 'agriculture',
        type: 'PRODUCT',
        description: 'Primary agricultural produce and raw materials'
      }
    });

    const textiles = await prisma.category.upsert({
      where: { slug: 'textiles-apparel' },
      update: {},
      create: {
        id: 'cat-textile',
        name: 'Textiles & Apparel',
        slug: 'textiles-apparel',
        type: 'PRODUCT',
        description: 'Fabrics, traditional wear, and modern clothing'
      }
    });

    // Level 2: Categories
    const grains = await prisma.category.upsert({
      where: { slug: 'grains-cereals' },
      update: {},
      create: {
        id: 'cat-grains',
        name: 'Grains & Cereals',
        slug: 'grains-cereals',
        type: 'PRODUCT',
        parentId: agriculture.id
      }
    });

    const fabrics = await prisma.category.upsert({
      where: { slug: 'fabrics' },
      update: {},
      create: {
        id: 'cat-fabrics',
        name: 'Fabrics',
        slug: 'fabrics',
        type: 'PRODUCT',
        parentId: textiles.id
      }
    });

    // Level 3: Sub-categories
    await prisma.category.upsert({
      where: { slug: 'maize' },
      update: {},
      create: {
        name: 'Maize',
        slug: 'maize',
        type: 'PRODUCT',
        parentId: grains.id
      }
    });

    await prisma.category.upsert({
      where: { slug: 'kitenge' },
      update: {},
      create: {
        name: 'Kitenge',
        slug: 'kitenge',
        type: 'PRODUCT',
        parentId: fabrics.id
      }
    });

    // 3. Markets & Hierarchy
    console.log('\n🏪 Creating markets and internal structure...');
    const m1 = await prisma.market.upsert({
      where: { uniqueCode: 'NAK-001' },
      update: {},
      create: {
        id: 'm1',
        cityId: city.id,
        name: 'Nakasero Market',
        uniqueCode: 'NAK-001',
        address: 'Nakasero, Kampala',
        marketType: 'PERMANENT',
        description: 'Historic fresh food and produce market in Kampala'
      }
    });

    // Admin user for Nakasero (from existing)
    const superAdminPassword = await hash('superadmin123', 10);
    const superAdminUser = await prisma.user.upsert({
      where: { email: 'superadmin@marketmaster.com' },
      update: {},
      create: {
        id: 'u-super',
        email: 'superadmin@marketmaster.com',
        passwordHash: superAdminPassword,
        status: 'ACTIVE',
        emailVerified: true
      }
    });

    // 4. Roles
    console.log('\n🔐 Ensuring roles exist...');
    const roles = [
      { name: 'SuperAdmin', level: 'SUPER_ADMIN' },
      { name: 'MarketMaster', level: 'MARKET_MASTER' },
      { name: 'GateCounter', level: 'PSEUDO_MARKET_ADMIN' },
      { name: 'Vendor', level: null },
      { name: 'Supplier', level: null }
    ];

    const rolesMap: { [key: string]: any } = {};
    for (const r of roles) {
      rolesMap[r.name] = await prisma.role.upsert({
        where: { name: r.name },
        update: { level: r.level as any },
        create: {
          name: r.name,
          description: `${r.name} role`,
          level: r.level as any,
        }
      });
    }

    // Assign SuperAdmin role
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: superAdminUser.id, roleId: rolesMap['SuperAdmin'].id } },
      update: {},
      create: { userId: superAdminUser.id, roleId: rolesMap['SuperAdmin'].id }
    });

    // 5. Market Hierarchy Details (Nakasero)
    console.log('\n🏗️ Building Nakasero internal hierarchy...');
    const level1 = await prisma.marketLevel.upsert({
      where: { uniqueCode: 'NAK-L1' },
      update: {},
      create: {
        id: 'nak-l1',
        marketId: m1.id,
        levelNumber: 1,
        uniqueCode: 'NAK-L1',
        name: 'Ground Floor',
        createdById: superAdminUser.id
      }
    });

    const sectionA = await prisma.marketSection.upsert({
      where: { uniqueCode: 'NAK-S1-A' },
      update: {},
      create: {
        id: 'nak-s1a',
        marketId: m1.id,
        levelId: level1.id,
        uniqueCode: 'NAK-S1-A',
        name: 'Fresh Produce Section',
        sectionType: 'RETAIL',
        createdById: superAdminUser.id
      }
    });

    // 6. Stakeholders & Vendors
    console.log('\n🤝 Creating test vendor...');
    const vendorPassword = await hash('market123', 10);
    const vUser = await prisma.user.upsert({
      where: { email: 'vendor.test@marketmaster.com' },
      update: {},
      create: {
        id: 'u-vendor-1',
        email: 'vendor.test@marketmaster.com',
        passwordHash: vendorPassword,
        status: 'ACTIVE',
        emailVerified: true
      }
    });

    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: vUser.id, roleId: rolesMap['Vendor'].id } },
      update: {},
      create: { userId: vUser.id, roleId: rolesMap['Vendor'].id }
    });

    const stakeholder = await prisma.stakeholder.upsert({
      where: { userId: vUser.id },
      update: {},
      create: {
        id: 'st-vendor-1',
        userId: vUser.id,
        stakeholderType: 'VENDOR',
        kycStatus: 'VERIFIED'
      }
    });

    const vendor = await prisma.vendor.upsert({
      where: { stakeholderId: stakeholder.id },
      update: {},
      create: {
        id: 'v-1',
        stakeholderId: stakeholder.id,
        vendorCode: 'V-NAK-001',
        businessName: 'Buganda Road Fresh Produce',
        primaryMarketId: m1.id
      }
    });

    // 7. Stalls & Products
    console.log('\n📦 Creating stall and products...');
    
    // We need a member to create a shop/stall (simplified for seed)
    const memberStakeholder = await prisma.stakeholder.upsert({
      where: { userId: superAdminUser.id },
      update: {},
      create: {
        id: 'st-member-1',
        userId: superAdminUser.id,
        stakeholderType: 'MEMBER'
      }
    });

    const member = await prisma.member.upsert({
      where: { stakeholderId: memberStakeholder.id },
      update: {},
      create: {
        id: 'mem-1',
        stakeholderId: memberStakeholder.id,
        membershipNumber: 'MEM-001',
        businessName: 'Market Authority Leasing',
        registrationNumber: 'REG-001'
      }
    });

    const shop = await prisma.shop.upsert({
      where: { uniqueCode: 'NAK-SH-001' },
      update: {},
      create: {
        id: 'sh-1',
        marketId: m1.id,
        levelId: level1.id,
        sectionId: sectionA.id,
        memberId: member.id,
        uniqueCode: 'NAK-SH-001',
        shopNumber: 'SH-001',
        shopName: 'Central Fresh Hub',
        monthlyRent: new Prisma.Decimal(150000),
        contractStartDate: new Date(),
        contractEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        createdById: superAdminUser.id
      }
    });

    const stall = await prisma.stall.upsert({
      where: { uniqueCode: 'NAK-ST-001' },
      update: {},
      create: {
        id: 'stl-1',
        shopId: shop.id,
        vendorId: vendor.id,
        sectionId: sectionA.id,
        levelId: level1.id,
        marketId: m1.id,
        uniqueCode: 'NAK-ST-001',
        stallNumber: 'STL-001',
        category: 'Agriculture',
        dailyRate: new Prisma.Decimal(5000),
        contractStartDate: new Date(),
        createdById: superAdminUser.id
      }
    });

    const sampleProducts = [
      { name: 'Super White Maize Flour', cat: 'Agriculture', sub: 'Maize', unit: '50kg Bag', price: 120000 },
      { name: 'Organic Sanga Beef', cat: 'Food & Beverages', sub: 'Beef', unit: '1kg', price: 14000 },
      { name: 'Genuine Kitenge Fabric', cat: 'Textiles & Apparel', sub: 'Kitenge', unit: '6 Yards', price: 45000 }
    ];

    for (let i = 0; i < sampleProducts.length; i++) {
        const p = sampleProducts[i];
        await prisma.product.upsert({
            where: { sku: `SKU-00${i+1}` },
            update: {},
            create: {
                stallId: stall.id,
                name: p.name,
                category: p.cat,
                subCategory: p.sub,
                unit: p.unit,
                price: new Prisma.Decimal(p.price),
                sku: `SKU-00${i+1}`,
                isActive: true,
                isApproved: true,
                createdById: vUser.id
            }
        });
    }

    console.log('\n✨ Database seeded successfully with Ugandan MMIS datasets!');
    console.log('─'.repeat(50));
    console.log('Available test users:');
    console.log('  1. superadmin@marketmaster.com / superadmin123 (SuperAdmin)');
    console.log('  2. vendor.test@marketmaster.com / market123 (Test Vendor)');
    console.log('─'.repeat(50));

  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
