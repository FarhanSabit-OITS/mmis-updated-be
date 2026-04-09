import { PrismaClient, AdminLevel, UserStatus, MfaType, MarketType } from '@prisma/client';
import { hash } from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

export async function seedNakaseroOwino(prisma: PrismaClient, roleMap: Record<string, string>, cityIdKLA: string) {
  console.log('\n=======================================');
  console.log('🌱 Seeding Markets: Nakasero & Owino...');
  console.log('=======================================');

  const jsonPath = path.join(__dirname, '../data/nakasero_owino_data.json');
  console.log(`Loading market data from ${jsonPath}...`);
  const rawData = fs.readFileSync(jsonPath, 'utf8');
  const marketData = JSON.parse(rawData);

  console.log('🏪 Creating markets...');
  
  const createdMarkets: Record<string, string> = {};

  for (const m of marketData.markets) {
    const market = await prisma.market.upsert({
      where: { uniqueCode: m.uniqueCode },
      update: {},
      create: {
        id: m.id,
        cityId: cityIdKLA,
        name: m.name,
        uniqueCode: m.uniqueCode,
        address: m.address,
        marketType: m.marketType as MarketType,
        categories: m.categories,
      }
    });
    createdMarkets[m.id] = market.id;
    console.log(`✅ Market: ${m.name}`);
  }

  for (const userDef of marketData.users) {
      const pwHash = await hash(userDef.passwordPlain, 10);
      
      const adminOptions: any = {};
      if (userDef.role === 'MarketMaster' && userDef.marketId) {
          adminOptions.create = {
              adminLevel: AdminLevel.MARKET_MASTER,
              marketMaster: { create: { marketId: createdMarkets[userDef.marketId] } }
          };
      }

      await prisma.user.upsert({
        where: { email: userDef.email },
        update: {},
        create: {
          email: userDef.email,
          passwordHash: pwHash,
          phone: userDef.phone,
          status: UserStatus.ACTIVE,
          emailVerified: true,
          mfaType: MfaType.NONE,
          userRoles: { create: { roleId: roleMap[userDef.role] } },
          profile: {
            create: {
              firstName: userDef.firstName,
              lastName: userDef.lastName,
              primaryPhone: userDef.phone,
              primaryEmail: userDef.email,
              country: userDef.country,
            }
          },
          ...(Object.keys(adminOptions).length > 0 ? { admin: adminOptions } : {})
        },
      });
      console.log(`✅ User: ${userDef.email} [${userDef.role}]`);
  }
}
