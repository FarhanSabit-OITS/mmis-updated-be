import { PrismaClient, AdminLevel, UserStatus, MfaType, PseudoMarketRole } from "@prisma/client";
import * as bcrypt from "bcryptjs";

export async function seedAdmins(prisma: PrismaClient, roleMap: Record<string, string>) {
  console.log("👤 Onboarding System Administrators...");

  const hashedPassword = bcrypt.hashSync("Password@123", 10);

  // 1. Super Admin
  const superAdminUser = await prisma.user.upsert({
    where: { email: "superadmin@mmis.ug" },
    update: { passwordHash: hashedPassword, status: UserStatus.ACTIVE },
    create: {
      email: "superadmin@mmis.ug",
      passwordHash: hashedPassword,
      phone: "+256700000001",
      emailVerified: true,
      phoneVerified: true,
      status: UserStatus.ACTIVE,
      mfaType: MfaType.NONE,
      userRoles: { create: { roleId: roleMap["SuperAdmin"] } },
      profile: {
        create: {
          firstName: "System",
          lastName: "Administrator",
          primaryPhone: "+256700000001",
          primaryEmail: "superadmin@mmis.ug",
          country: "Uganda",
          verificationLevel: "FULL",
        },
      },
      admin: {
        create: {
          adminLevel: AdminLevel.SUPER_ADMIN,
          employeeId: "EMP-0001",
          superAdmin: { create: {} },
        },
      },
    },
  });

  const superAdminRecord = await prisma.admin.findUniqueOrThrow({
    where: { userId: superAdminUser.id },
  });

  return { superAdmin: superAdminRecord };
}

export async function seedMarketStaff(prisma: PrismaClient, roleMap: Record<string, string>, marketMap: Record<string, any>, superAdminId: string) {
  console.log("👥 Onboarding Market-Specific Staff...");
  const hashedPassword = bcrypt.hashSync("Password@123", 10);

  // 2. Kabale Market Master
  const kabaleUser = await prisma.user.upsert({
    where: { email: "master.admin@kabalemarket.ug" },
    update: { status: UserStatus.ACTIVE },
    create: {
      email: "master.admin@kabalemarket.ug",
      passwordHash: hashedPassword,
      phone: "+256700000012",
      emailVerified: true,
      status: UserStatus.ACTIVE,
      userRoles: { create: { roleId: roleMap["MarketMaster"] } },
      profile: {
        create: {
          firstName: "John",
          lastName: "Byaruhanga",
          primaryPhone: "+256700000012",
          primaryEmail: "master.admin@kabalemarket.ug",
          country: "Uganda",
          verificationLevel: "FULL",
        },
      },
      admin: {
        create: {
          adminLevel: AdminLevel.MARKET_MASTER,
          employeeId: "MM-KAB-001",
          assignedByAdminId: superAdminId,
          marketMaster: { create: { 
            marketId: marketMap["MKT-KABALE"].id 
          } }
        },
      },
    },
  });

  // 3. Jinja Market Master
  const jinjaUser = await prisma.user.upsert({
    where: { email: "master.admin@jinjamarket.ug" },
    update: { status: UserStatus.ACTIVE },
    create: {
      email: "master.admin@jinjamarket.ug",
      passwordHash: hashedPassword,
      phone: "+256700000013",
      emailVerified: true,
      status: UserStatus.ACTIVE,
      userRoles: { create: { roleId: roleMap["MarketMaster"] } },
      profile: {
        create: {
          firstName: "Emma",
          lastName: "Okello",
          primaryPhone: "+256700000013",
          primaryEmail: "master.admin@jinjamarket.ug",
          country: "Uganda",
          verificationLevel: "FULL",
        },
      },
      admin: {
        create: {
          adminLevel: AdminLevel.MARKET_MASTER,
          employeeId: "MM-JIN-001",
          assignedByAdminId: superAdminId,
          marketMaster: { create: { 
            marketId: marketMap["MKT-JINJA"].id 
          } }
        },
      },
    },
  });

  const kabaleAdmin = await prisma.admin.findUniqueOrThrow({ where: { userId: kabaleUser.id } });
  const jinjaAdmin = await prisma.admin.findUniqueOrThrow({ where: { userId: jinjaUser.id } });

  return { kabaleAdmin, jinjaAdmin };
}
