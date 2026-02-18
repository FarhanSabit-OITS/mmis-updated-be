
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAllPseudoAdmins() {
    const pseudoAdmins = await prisma.pseudoMarketAdmin.findMany({
        include: {
            admin: { include: { user: true } },
            market: true
        }
    });

    console.log(`Total PseudoMarketAdmins found: ${pseudoAdmins.length}`);
    pseudoAdmins.forEach(pa => {
        console.log(`- ${pa.admin?.user?.email} | Role: ${pa.role} | Market: ${pa.market?.name}`);
    });

    await prisma.$disconnect();
}

checkAllPseudoAdmins().catch(err => {
    console.error(err);
    process.exit(1);
});
