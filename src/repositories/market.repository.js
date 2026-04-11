const prisma = require('../shared/prisma');

module.exports = {
  findAllActive: async () => {
    return await prisma.market.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        uniqueCode: true,
      }
    });
  },

  findGateById: async (gateId) => {
    return await prisma.marketGate.findUnique({
      where: { id: gateId },
      include: { market: true }
    });
  },

  findSupplierById: async (supplierId) => {
    // Try UUID first
    let supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
      include: { stakeholder: true }
    });

    if (!supplier) {
      // Try Code
      supplier = await prisma.supplier.findUnique({
        where: { supplierCode: supplierId },
        include: { stakeholder: true }
      });
    }

    if (!supplier) {
      // Try Linked User ID
      supplier = await prisma.supplier.findFirst({
        where: {
          stakeholder: {
            userId: supplierId
          }
        },
        include: { stakeholder: true }
      });
    }

    return supplier;
  },

  findUserById: async (userId) => {
    return await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });
  },

  createMarketToken: async (tokenData) => {
    return await prisma.marketToken.create({
      data: tokenData
    });
  }
};