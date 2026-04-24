const prisma = require('../shared/prisma');
const { PaginationResponse } = require('../utils');

module.exports = {
  getRentContractList: async ({ page = 1, limit = 10, shopId, stallId, vendorId, marketId, status }) => {
    const skip = (page - 1) * limit;
    
    const where = {
      ...(shopId && { shopId }),
      ...(stallId && { stallId }),
      ...(vendorId && { vendorId }),
      ...(marketId && { marketId }),
      ...(status && { status }),
    };

    const [contracts, total] = await Promise.all([
      prisma.rentContract.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
        include: {
          vendor: { include: { stakeholder: { include: { user: { select: { email: true, phone: true } } } } } },
          shop: true,
          stall: true,
          market: true
        },
      }),
      prisma.rentContract.count({ where }),
    ]);

    return {
      contracts,
      pagination: new PaginationResponse(total, page, Number(limit))
    }
  },
  
  getRentContractDetailsById: async (contractId) => {
    return await prisma.rentContract.findUnique({
      where: { id: contractId },
      include: {
        vendor: { include: { stakeholder: { include: { user: { select: { email: true, phone: true, profile: true } } } } } },
        shop: { include: { member: true } },
        stall: true,
        market: true,
        documents: true,
      },
    });
  },

  createRentContract: async (contractData) => {
    return await prisma.rentContract.create({
      data: contractData,
      include: {
        vendor: true,
        shop: true,
        stall: true,
        market: true
      }
    });
  },

  editRentContract: async (contractId, updateData) => {
    return await prisma.rentContract.update({
      where: { id: contractId },
      data: updateData,
    });
  },

  deleteRentContract: async (contractId) => {
    return await prisma.rentContract.update({
      where: { id: contractId },
      data: { status: "TERMINATED" }
    });
  }
};
