const prisma = require('../shared/prisma');
const { PaginationResponse } = require('../utils');

module.exports = {
  getGateOperationList: async ({ page = 1, limit = 10, gateId, operationType, entityType, tokenId, recordedById, dateFrom, dateTo }) => {
    const skip = (page - 1) * limit;
    
    const where = {
      ...(gateId && { gateId }),
      ...(operationType && { operationType }),
      ...(entityType && { entityType }),
      ...(tokenId && { tokenId }),
      ...(recordedById && { recordedById }),
    };

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const [operations, total] = await Promise.all([
      prisma.gateOperation.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
        include: {
          gate: true,
          token: true,
          recordedBy: {
            select: { id: true, email: true, phone: true }
          }
        },
      }),
      prisma.gateOperation.count({ where }),
    ]);

    return {
      operations,
      pagination: new PaginationResponse(total, page, Number(limit))
    }
  },
  
  getGateOperationDetailsById: async (operationId) => {
    return await prisma.gateOperation.findUnique({
      where: { id: operationId },
      include: {
        gate: { include: { market: true } },
        token: true,
        recordedBy: {
          select: { id: true, email: true, phone: true, profile: true }
        }
      },
    });
  },

  createGateOperation: async (data) => {
    return await prisma.gateOperation.create({
      data,
      include: {
        gate: true,
        token: true
      }
    });
  }
};
