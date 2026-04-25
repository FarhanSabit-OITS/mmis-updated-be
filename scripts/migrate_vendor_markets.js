const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrate() {
    console.log("🚀 Starting Vendor PrimaryMarketId Migration...");

    const vendors = await prisma.vendor.findMany({
        where: { primaryMarketId: null },
        include: {
            stalls: { take: 1 },
            stakeholder: {
                include: {
                    member: {
                        include: {
                            shops: { take: 1 }
                        }
                    }
                }
            }
        }
    });

    console.log(`🔍 Found ${vendors.length} vendors with missing primaryMarketId.`);

    let migratedCount = 0;

    for (const vendor of vendors) {
        let targetMarketId = null;

        if (vendor.stalls && vendor.stalls.length > 0) {
            targetMarketId = vendor.stalls[0].marketId;
        } else if (
            vendor.stakeholder &&
            vendor.stakeholder.member &&
            vendor.stakeholder.member.shops &&
            vendor.stakeholder.member.shops.length > 0
        ) {
            targetMarketId = vendor.stakeholder.member.shops[0].marketId;
        }

        if (targetMarketId) {
            await prisma.vendor.update({
                where: { id: vendor.id },
                data: { primaryMarketId: targetMarketId }
            });
            migratedCount++;
        }
    }

    console.log(`✅ Migration complete. Updated ${migratedCount} vendors.`);
}

migrate()
    .catch(e => {
        console.error("❌ Migration failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
