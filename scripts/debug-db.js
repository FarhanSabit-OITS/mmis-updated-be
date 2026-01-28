const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const roles = await prisma.role.findMany();
    console.log('Roles:', JSON.stringify(roles, null, 2));
    const users = await prisma.user.findMany({
        where: { email: { contains: 'marketmaster.com' } }
    });
    console.log('Test Users:', JSON.stringify(users, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
