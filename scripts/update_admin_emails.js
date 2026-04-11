const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateAdmins() {
  await prisma.user.updateMany({
    where: { email: "superadmin@kabalemarket.ug" },
    data: { email: "superadmin@mmis.ug" }
  });
  await prisma.userProfile.updateMany({
    where: { primaryEmail: "superadmin@kabalemarket.ug" },
    data: { primaryEmail: "superadmin@mmis.ug" }
  });
  
  await prisma.user.updateMany({
    where: { email: "marketmaster@kabalemarket.ug" },
    data: { email: "master.admin@kabalemarket.ug" }
  });
  await prisma.userProfile.updateMany({
    where: { primaryEmail: "marketmaster@kabalemarket.ug" },
    data: { primaryEmail: "master.admin@kabalemarket.ug" }
  });

  await prisma.user.updateMany({
    where: { email: "mm.jinja@marketmaster.ug" },
    data: { email: "master.admin@jinjamarket.ug" }
  });
  await prisma.userProfile.updateMany({
    where: { primaryEmail: "mm.jinja@marketmaster.ug" },
    data: { primaryEmail: "master.admin@jinjamarket.ug" }
  });


  console.log("Updated Admin Emails successfully!");
}

updateAdmins()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
