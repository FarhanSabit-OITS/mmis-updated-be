const prisma = require('../shared/prisma');
const { PaginationResponse } = require('../utils');

module.exports = {
  /**
   * Record a new stock movement (Inbound/Outbound)
   */
  recordMovement: async (data) => {
    return await prisma.stockMovement.create({
      data: {
        ...data,
        quantity: parseFloat(data.quantity)
      }
    });
  },

  /**
   * Get stock movements for a specific market with pagination
   */
  getMarketMovements: async (marketId, { page = 1, limit = 10, type, startDate, endDate }) => {
    const skip = (page - 1) * limit;

    const where = {
      marketId,
      ...(type && { movementType: type }),
      ...(startDate && endDate && {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      })
    };

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
            createdBy: { include: { profile: true } },
            inspectedBy: { include: { stakeholder: { include: { user: { include: { profile: true } } } } } }
        }
      }),
      prisma.stockMovement.count({ where })
    ]);

    return {
      movements,
      pagination: new PaginationResponse(total, page, limit)
    };
  },

  /**
   * Get an inventory summary for a market (aggregation of movements)
   */
  getMarketInventorySummary: async (marketId) => {
    // This is a simplified summary grouping by productName
    const movements = await prisma.stockMovement.groupBy({
      by: ['productName', 'movementType'],
      where: { marketId },
      _sum: {
        quantity: true
      }
    });

    return movements;
  }
};
