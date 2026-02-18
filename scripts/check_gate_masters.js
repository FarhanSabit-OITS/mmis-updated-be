
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkGateMasters() {
    console.log('--- Checking Gate Masters / Staff assigned to Markets ---');

    const markets = await prisma.market.findMany({
        include: {
            marketMasters: {
                include: {
                    admin: {
                        include: { user: true }
                    }
                }
            },
            pseudoAdmins: {
                where: {
                    role: { in: ['GATE_COUNTER', 'SECURITY_ADMIN'] }
                },
                include: {
                    admin: {
                        include: { user: true }
                    }
                }
            },
            gates: {
                include: {
                    assignedStaff: { include: { admin: { include: { user: true } } } },
                    assignedCounter: { include: { admin: { include: { user: true } } } }
                }
            }
        }
    });

    console.log(`\nTotal Markets found: ${markets.length}\n`);

    for (const m of markets) {
        console.log(`Market: ${m.name} (${m.uniqueCode})`);
        console.log(`- Market Masters: ${m.marketMasters.length}`);
        m.marketMasters.forEach(mm => {
            console.log(`  * ${mm.admin?.user?.email} (ID: ${mm.id})`);
        });

        console.log(`- Gate Staff (Pseudo Admins): ${m.pseudoAdmins.length}`);
        m.pseudoAdmins.forEach(pa => {
            console.log(`  * ${pa.admin?.user?.email} [Role: ${pa.role}]`);
        });

        console.log(`- Gates: ${m.gates.length}`);
        m.gates.forEach(g => {
            const staff = g.assignedStaff?.admin?.user?.email || 'None';
            const counter = g.assignedCounter?.admin?.user?.email || 'None';
            console.log(`  * Gate ${g.gateNumber} (${g.gateName || 'No Name'}): Staff: ${staff}, Counter: ${counter}`);
        });
        console.log('-------------------------------------------\n');
    }

    await prisma.$disconnect();
}

checkGateMasters().catch(err => {
    console.error(err);
    process.exit(1);
});
