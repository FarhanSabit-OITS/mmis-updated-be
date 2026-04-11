import { PrismaClient } from "@prisma/client";

export async function cleanup(prisma: PrismaClient) {
  console.log("🧹 Starting database cleanup...");

  // Delete in order of dependency (leaf to root)
  // 1. Operational data (Extended — include all Phase 3 tables)
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.supportTicket.deleteMany({});  // ✅ Added: was missing

  // Financial
  await prisma.rentContract.deleteMany({});
  await prisma.taxPayment.deleteMany({});
  await prisma.rentPayment.deleteMany({});
  await prisma.supplierInvoice.deleteMany({});

  // Supply Chain
  await prisma.supplierRating.deleteMany({});
  await prisma.supplierBid.deleteMany({});
  await prisma.requisition.deleteMany({});

  // Inventory & Products
  await prisma.stockMovement.deleteMany({});   // ✅ Added: was missing
  await prisma.product.deleteMany({}).catch(() => {}); // May not exist yet — safe skip

  // KYC
  await prisma.kycSubmission.deleteMany({}).catch(() => {}); // ✅ Added: was missing

  // Gate Tokens
  await prisma.gateEntry.deleteMany({});
  await prisma.gateOperation.deleteMany({});
  await prisma.marketToken.deleteMany({});
  
  await prisma.facility.deleteMany({});
  
  // 2. Market Structure
  await prisma.marketAisle.deleteMany({});
  await prisma.marketSection.deleteMany({});
  await prisma.marketLevel.deleteMany({});
  await prisma.marketGate.deleteMany({});
  await prisma.marketMaster.deleteMany({});
  await prisma.pseudoMarketAdmin.deleteMany({});
  
  // 3. Stakeholders
  await prisma.vendor.deleteMany({});
  await prisma.member.deleteMany({});
  await prisma.supplier.deleteMany({});
  await prisma.stakeholder.deleteMany({});
  
  // 4. Admins & Roles (Optional: preserve system roles if they are static, but we'll recreate)
  await prisma.superAdmin.deleteMany({});
  await prisma.admin.deleteMany({});
  await prisma.userRole.deleteMany({});
  
  // 5. Hierarchy
  await prisma.market.deleteMany({});
  await prisma.city.deleteMany({});
  await prisma.district.deleteMany({});
  await prisma.geolocation.deleteMany({});
  
  // 6. Users
  await prisma.userProfile.deleteMany({});
  await prisma.user.deleteMany({});
  
  // Note: We don't delete Role records here if we want to upsert them, 
  // but since it's a "Clean" seed, we'll clear them too to ensure ID consistency.
  await prisma.rolePermission.deleteMany({});
  await prisma.role.deleteMany({});

  console.log("✅ Cleanup finished.");
}
