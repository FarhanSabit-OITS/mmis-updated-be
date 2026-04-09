const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRoles() {
  try {
    const roles = await prisma.role.findMany();
    console.log('Current Roles in DB:', roles.map(r => r.name));
    process.exit(0);
  } catch (err) {
    console.error('Error fetching roles:', err);
    process.exit(1);
  }
}

checkRoles();
