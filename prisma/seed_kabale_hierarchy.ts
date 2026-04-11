import { PrismaClient, FacilityType, FacilityStatus, OccupationStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function seedKabaleHierarchy() {
  console.log("🌱 Seeding Kabale deep hierarchy...");

  // 1. Find Kabale Market
  const kabale = await prisma.market.findFirst({
    where: { name: { contains: "Kabale" } }
  });

  if (!kabale) {
    console.error("❌ Kabale market not found. Run base seed first.");
    return;
  }

  // 2. Find a National Admin for createdById
  const adminEntry = await prisma.admin.findFirst({
    where: { adminLevel: "SUPER_ADMIN" },
    include: { user: true }
  });

  if (!adminEntry) {
    console.error("❌ Super Admin not found.");
    return;
  }
  const admin = adminEntry.user;

  // 3. Find Authority Member for memberId
  const authorityMember = await prisma.member.findFirst({
    where: { businessName: { contains: kabale.name } }
  });

  if (!authorityMember) {
     console.error("❌ Authority Member for Kabale not found.");
     return;
  }

  // 4. Create Levels (Ground, First, Second)
  const levels = [
    { num: 1, name: "Ground Floor" },
    { num: 2, name: "First Floor" },
    { num: 3, name: "Rooftop Terrace" }
  ];

  for (const l of levels) {
    const level = await prisma.marketLevel.upsert({
      where: { marketId_levelNumber: { marketId: kabale.id, levelNumber: l.num } },
      update: {},
      create: {
        marketId: kabale.id,
        levelNumber: l.num,
        uniqueCode: `${kabale.uniqueCode}-L${l.num}`,
        name: l.name,
        createdById: admin.id
      }
    });

    console.log(`  - Level ${l.num}: ${l.name}`);

    // Create Sections for Ground Floor
    if (l.num === 1) {
      const sections = ["Fresh Produce", "Textiles", "Electronics"];
      for (const sName of sections) {
        const sec = await prisma.marketSection.upsert({
          where: { marketId_levelId_name: { marketId: kabale.id, levelId: level.id, name: sName } },
          update: {},
          create: {
            marketId: kabale.id,
            levelId: level.id,
            name: sName,
            uniqueCode: `${kabale.uniqueCode}-SEC-${sName.toUpperCase().replace(/\s/g, "")}`,
            sectionType: "COMMERCIAL",
            createdById: admin.id
          }
        });
        
        console.log(`    - Section: ${sName}`);

        // Create Aisles for Fresh Produce
        if (sName === "Fresh Produce") {
          for (let i = 1; i <= 2; i++) {
            const aisleName = `Aisle ${String.fromCharCode(64 + i)}`;
            const a = await prisma.marketAisle.upsert({
              where: { sectionId_aisleNumber: { sectionId: sec.id, aisleNumber: i.toString() } },
              update: {},
              create: {
                sectionId: sec.id,
                aisleNumber: i.toString(),
                name: aisleName,
                uniqueCode: `${sec.uniqueCode}-A${i}`,
                createdById: admin.id
              }
            });

            console.log(`      - Aisle: ${aisleName}`);

            // Create Facilities/Stalls
            for (let j = 1; j <= 3; j++) {
              const unitNo = `${sName[0]}${i}${j}`;
              await prisma.facility.upsert({
                where: { marketId_unitNumber: { marketId: kabale.id, unitNumber: unitNo } },
                update: {},
                create: {
                  marketId: kabale.id,
                  levelId: level.id,
                  sectionId: sec.id,
                  aisleId: a.id,
                  memberId: authorityMember.id,
                  unitNumber: unitNo,
                  uniqueCode: `FAC-${kabale.uniqueCode}-${unitNo}`,
                  type: FacilityType.STALL,
                  status: FacilityStatus.ACTIVE,
                  occupationStatus: OccupationStatus.VACANT,
                  createdById: admin.id
                }
              });
            }
          }
        }
      }
    }
  }

  console.log("✅ Kabale hierarchy seeded successfully.");
}

seedKabaleHierarchy()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
