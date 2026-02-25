
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRoles() {
    const roles = await prisma.role.findMany({
        include: {
            userRoles: {
                include: { user: true }
            }
        }
    });

    console.log('--- Roles and Users ---');
    roles.forEach(r => {
        if (r.userRoles.length > 0) {
            console.log(`Role: ${r.name} (${r.level}) - Users: ${r.userRoles.length}`);
            r.userRoles.forEach(ur => {
                console.log(`  * ${ur.user?.email}`);
            });
        }
    });

    await prisma.$disconnect();
}

checkRoles().catch(err => {
    console.error(err);
    process.exit(1);
});
