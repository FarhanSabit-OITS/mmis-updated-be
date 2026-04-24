const prisma = require('../shared/prisma');
const { PaginationResponse } = require('../utils');

module.exports = {
  getGateList: async ({ page = 1, limit = 10, search, marketId, gateType, status }) => {
    const skip = (page - 1) * limit;
    const where = {
      ...(marketId && { marketId }),
      ...(gateType && { gateType }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { code: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [gates, total] = await Promise.all([
      prisma.marketGate.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
        include: {
          market: true,
          counters: true,
        },
      }),
      prisma.marketGate.count({ where }),
    ]);

    return {
      gates,
      pagination: new PaginationResponse(total, page, Number(limit))
    }
  },
  
  getGateDetailsById: async (gateId) => {
    return await prisma.marketGate.findUnique({
      where: { id: gateId },
      include: {
        market: true,
        counters: true,
        gateOperations: {
          take: 5,
          orderBy: { createdAt: "desc" }
        }
      },
    });
  },

  createGate: async (gateData) => {
    return await prisma.marketGate.create({
      data: gateData,
      include: {
        market: true
      },
    });
  },

  editGate: async (gateId, updateData) => {
    return await prisma.marketGate.update({
      where: { id: gateId },
      data: updateData,
      include: {
        market: true
      },
    });
  },

  deleteGate: async (gateId) => {
    return await prisma.marketGate.update({
      where: { id: gateId },
      data: { status: "INACTIVE" }
    });
  }
};
