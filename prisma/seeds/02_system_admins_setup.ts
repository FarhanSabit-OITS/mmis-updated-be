import { PrismaClient, AdminLevel, UserStatus, MfaType } from '@prisma/client';
import { hash } from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

export async function seedSystemAdmins(prisma: PrismaClient, roleMap: Record<string, string>) {
  console.log('\n=======================================');
  console.log('👤 Seeding System Admins...');
  console.log('=======================================');

  const jsonPath = path.join(__dirname, '../data/system_admins.json');
  console.log(`Loading system admins data from ${jsonPath}...`);
  const rawData = fs.readFileSync(jsonPath, 'utf8');
  const adminsData = JSON.parse(rawData);
  
  let superAdminUser1 = null;

  for (const adminData of adminsData) {
    const pwHash = await hash(adminData.passwordPlain, 10);
    const user = await prisma.user.upsert({
      where: { email: adminData.email },
      update: {
        passwordHash: pwHash,
        status: 'ACTIVE',
        emailVerified: true,
      },
      create: {
        email: adminData.email,
        passwordHash: pwHash,
        phone: adminData.phone,
        status: 'ACTIVE',
        emailVerified: true,
        mfaType: MfaType.NONE,
        userRoles: { create: { roleId: roleMap['SuperAdmin'] } },
        profile: {
          create: {
            firstName: adminData.firstName,
            lastName: adminData.lastName,
            primaryPhone: adminData.phone,
            primaryEmail: adminData.email,
            country: adminData.country,
            verificationLevel: 'FULL',
          }
        },
        admin: {
          create: {
            adminLevel: AdminLevel.SUPER_ADMIN,
            employeeId: adminData.employeeId,
            superAdmin: { create: {} }
          }
        }
      },
    });
    console.log(`✅ User: ${adminData.email} [SuperAdmin]`);
    
    if (!superAdminUser1) {
        superAdminUser1 = user;
    }
  }

  if (!superAdminUser1) throw new Error("No super admin created");
  
  return { superAdminUser1 };
}
