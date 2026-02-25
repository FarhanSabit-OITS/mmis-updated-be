
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function testCreateStaff() {
    console.log('--- Testing Gate Counter Creation Logic ---');

    const market = await prisma.market.findFirst({ where: { uniqueCode: 'KABALE_CENTRAL_001' } });
    if (!market) {
        console.log('Kabale market not found');
        return;
    }

    const email = 'test.counter@kabale.market';
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        console.log('Test user already exists, skipping creation');
    } else {
        const passwordHash = await bcrypt.hash('Password123!', 10);
        const roleId = (await prisma.role.findUnique({ where: { name: 'GateCounter' } })).id;

        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email,
                    passwordHash,
                    status: 'ACTIVE',
                    emailVerified: true,
                    userRoles: { create: { roleId } }
                }
            });

            const admin = await tx.admin.create({
                data: { userId: user.id, adminLevel: 'PSEUDO_MARKET_ADMIN' }
            });

            const pseudo = await tx.pseudoMarketAdmin.create({
                data: { adminId: admin.id, marketId: market.id, role: 'GATE_COUNTER' }
            });
            return pseudo;
        });
        console.log('Created Gate Counter:', result);
    }

    // Verify
    const staff = await prisma.pseudoMarketAdmin.findMany({
        where: { marketId: market.id, role: 'GATE_COUNTER' },
        include: { admin: { include: { user: true } } }
    });
    console.log(`Gate Counters for Kabale: ${staff.length}`);
    staff.forEach(s => console.log(`- ${s.admin.user.email}`));

    await prisma.$disconnect();
}

testCreateStaff().catch(console.error);
