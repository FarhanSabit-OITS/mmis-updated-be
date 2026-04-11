import { PrismaClient } from "@prisma/client";

export async function seedRoles(prisma: PrismaClient) {
  console.log("🛡️ Initializing RBAC (Role-Based Access Control)...");

  const roles = [
    {
      name: "SuperAdmin",
      description: "Full system access across all markets and regions.",
      isSystem: true,
      permissions: { all: true }
    },
    {
      name: "MarketMaster",
      description: "Administrative authority over a specific market facility.",
      isSystem: true,
      permissions: { market: ["read", "update"], facilities: ["all"] }
    },
    {
      name: "RevenueCollector",
      description: "Field staff responsible for daily rent and tax collection.",
      isSystem: false,
      permissions: { transactions: ["create", "read"] }
    },
    {
      name: "GateCounter",
      description: "Security staff managing entry/exit tokens and stock movement.",
      isSystem: false,
      permissions: { gate: ["read", "update"] }
    }
  ];

  const roleMap: Record<string, string> = {};

  for (const role of roles) {
    const roleRecord = await prisma.role.upsert({
      where: { name: role.name },
      update: { 
        permissions: role.permissions as any 
      },
      create: {
        name: role.name,
        description: role.description,
        isSystem: role.isSystem,
        permissions: role.permissions as any,
      },
    });
    roleMap[role.name] = roleRecord.id;
  }

  return roleMap;
}
