const prisma = require('../shared/prisma')

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

    return { markets, total };
  },
  findMarketByName: async (name) =>
    await prisma.market.findUnique({ where: { name } })
};