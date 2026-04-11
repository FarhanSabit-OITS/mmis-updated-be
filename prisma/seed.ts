/**
 * prisma/seed.ts
 * 
 * Main Orchestrator for High-Fidelity Seeding.
 */

import { PrismaClient } from "@prisma/client";
import path from "path";

// Modular Imports
import { cleanup } from "./seeds/cleanup";
import { seedRoles } from "./seeds/roles";
import { seedGeo } from "./seeds/geo";
import { seedAdmins, seedMarketStaff } from "./seeds/admin";
import { seedMarkets } from "./seeds/markets";
import { processRegistries } from "./seeds/registry";

const prisma = new PrismaClient();

async function main() {
  const startTime = Date.now();
  console.log("🚀 Starting Global Seed Orchestrator...");

  try {
    // 1. Database Cleanup
    await cleanup(prisma);

    // 2. Core RBAC
    const roleMap = await seedRoles(prisma);

    // 3. Geographic Hierarchy
    const cityMap = await seedGeo(prisma);

    // 4. Global Admin (SuperAdmin)
    const { superAdmin } = await seedAdmins(prisma, roleMap);

    // 5. Market Infrastructure (Created by SuperAdmin)
    const marketMap = await seedMarkets(prisma, cityMap, superAdmin.id);

    // 6. Market Staff (Linked to Markets)
    await seedMarketStaff(prisma, roleMap, marketMap, superAdmin.id);

    // 7. Operational Data (Excel Ingestion)
    const dataDir = path.join(process.cwd(), "Data");
    await processRegistries(prisma, dataDir, marketMap, superAdmin.userId);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✨ Seeding completed successfully in ${duration}s!`);
    
  } catch (error) {
    console.error("❌ Critical Seeding Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();