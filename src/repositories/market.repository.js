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
  findMarketByName: async (name) =>
    await prisma.market.findUnique({ where: { name } })
};