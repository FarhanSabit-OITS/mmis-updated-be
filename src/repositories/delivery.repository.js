const prisma = require('../shared/prisma');
const { PaginationResponse } = require('../utils');

module.exports = {
  getDeliveryList: async ({ page = 1, limit = 10, stallId, supplierId, marketId, status, paymentStatus }) => {
    const skip = (page - 1) * limit;
    
    const where = {
      ...(stallId && { stallId }),
      ...(supplierId && { supplierId }),
      ...(marketId && { marketId }),
      ...(status && { status }),
      ...(paymentStatus && { paymentStatus }),
    };

    const [deliveries, total] = await Promise.all([
      prisma.delivery.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
        include: {
          supplier: { include: { stakeholder: true } },
          stall: true,
          market: true
        },
      }),
      prisma.delivery.count({ where }),
    ]);

    return {
      deliveries,
      pagination: new PaginationResponse(total, page, Number(limit))
    }
  },
  
  getDeliveryDetailsById: async (deliveryId) => {
    return await prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: {
        supplier: { include: { stakeholder: { include: { user: { select: { email: true, phone: true } } } } } },
        stall: { include: { vendor: { include: { stakeholder: true } } } },
        market: true,
      },
    });
  },

  createDelivery: async (deliveryData) => {
    return await prisma.delivery.create({
      data: deliveryData,
      include: {
        supplier: true,
        stall: true,
        market: true
      }
    });
  },

  editDelivery: async (deliveryId, updateData) => {
    return await prisma.delivery.update({
      where: { id: deliveryId },
      data: updateData,
    });
  }
};
