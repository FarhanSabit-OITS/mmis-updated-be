const prisma = require('../shared/prisma');
const { PaginationResponse } = require('../utils');

module.exports = {
  getStallList: async ({ page = 1, limit = 10, search, marketId, shopId, vendorId, status, occupationStatus, stallType }) => {
    const skip = (page - 1) * limit;
    const where = {
      ...(marketId && { marketId }),
      ...(shopId && { shopId }),
      ...(vendorId && { vendorId }),
      ...(status && { status }),
      ...(occupationStatus && { occupationStatus }),
      ...(stallType && { stallType }),
      ...(search && {
        OR: [
          { stallNumber: { contains: search, mode: "insensitive" } },
          { uniqueCode: { contains: search, mode: "insensitive" } },
          { stallName: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [stalls, total] = await Promise.all([
      prisma.stall.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
        include: {
          market: true,
          shop: true,
          vendor: { include: { stakeholder: true } },
          level: true,
          section: true,
          aisle: true
        },
      }),
      prisma.stall.count({ where }),
    ]);

    return {
      stalls,
      pagination: new PaginationResponse(total, page, Number(limit))
    }
  },
  
  getStallDetailsById: async (stallId) => {
    return await prisma.stall.findUnique({
      where: { id: stallId },
      include: {
        market: true,
        shop: true,
        vendor: { include: { stakeholder: { include: { user: { select: { id: true, email: true, phone: true } } } } } },
        level: true,
        section: true,
        aisle: true,
        createdBy: true
      },
    });
  },

  createStall: async (stallData) => {
    return await prisma.stall.create({
      data: stallData,
      include: {
        market: true,
        shop: true,
        vendor: true
      },
    });
  },

  editStall: async (stallId, updateData) => {
    return await prisma.stall.update({
      where: { id: stallId },
      data: updateData,
      include: {
        market: true,
        shop: true,
        vendor: true
      },
    });
  },

  deleteStall: async (stallId) => {
    return await prisma.stall.update({
      where: { id: stallId },
      data: { status: "INACTIVE" }
    });
  }
};
