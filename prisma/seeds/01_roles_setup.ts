import { PrismaClient, AdminLevel } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

export async function seedRoles(prisma: PrismaClient) {
  console.log('\n=======================================');
  console.log('🛡️ Seeding Roles...');
  console.log('=======================================');

  const jsonPath = path.join(__dirname, '../data/roles.json');
  console.log(`Loading roles data from ${jsonPath}...`);
  const rawData = fs.readFileSync(jsonPath, 'utf8');
  const rolesData = JSON.parse(rawData);

  const roleMap: Record<string, string> = {};

  for (const r of rolesData) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: r.level ? { level: r.level as AdminLevel } : {},
      create: {
        name: r.name,
        description: r.description,
        level: r.level ? (r.level as AdminLevel) : null,
      },
    });
    roleMap[r.name] = role.id;
    console.log(`✅ Role: ${r.name}`);
  }

  return { roleMap };
}
