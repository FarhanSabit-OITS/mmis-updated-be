const prisma = require('../shared/prisma');
const { PaginationResponse } = require('../utils');

module.exports = {
  createMarket: async (data) => {
    return await prisma.market.create({ data });
  },

  updateMarket: async (marketId, data) => {
    return await prisma.market.update({
      where: { id: marketId },
      data,
    });
  },

  getMarketById: async (marketId) => {
    return await prisma.market.findUnique({
      where: { id: marketId },
      include: {
        levels: true,
        sections: true,
        shops: true,
        stalls: true,
        gates: true,
      },
    });
  },
  getMarketList: async ({ page, limit, search, cityId }) => {
    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { displayName: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(cityId && { cityId }),
    };

    const [markets, total] = await Promise.all([
      prisma.market.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.market.count({ where }),
    ]);

    return {markets, pagination: new PaginationResponse(total, page, limit)}
  },
  findMarketByName: async (name) =>
    await prisma.market.findUnique({ where: { name } }),

  // Infrastructure Methods
  addLevel: async (marketId, data) => {
    return await prisma.marketLevel.create({
      data: { ...data, marketId }
    });
  },

  addSection: async (marketId, data) => {
    return await prisma.marketSection.create({
      data: { ...data, marketId }
    });
  },

  addAisle: async (sectionId, data) => {
    return await prisma.marketAisle.create({
      data: { ...data, sectionId }
    });
  },

  addGate: async (marketId, data) => {
    return await prisma.marketGate.create({
      data: { ...data, marketId }
    });
  },

  getMarketStakeholders: async (marketId) => {
    return await prisma.stakeholder.findMany({
      where: {
        OR: [
          { marketAuthority: { id: { not: undefined } } },
          { vendor: { primaryMarketId: marketId } }
        ]
      },
      include: {
        user: { include: { profile: true } },
        marketAuthority: true,
        vendor: true
      }
    });
  }
};