const inventoryRepository = require('../repositories/inventory.repository');

module.exports = {
  recordMovement: async (data, userId) => {
    return await inventoryRepository.recordMovement({
      ...data,
      createdById: userId
    });
  },

  getMarketMovements: async (marketId, query) => {
    return await inventoryRepository.getMarketMovements(marketId, {
      page: parseInt(query.page) || 1,
      limit: parseInt(query.limit) || 10,
      type: query.type,
      startDate: query.startDate,
      endDate: query.endDate
    });
  },

  getMarketStockSummary: async (marketId) => {
    const summary = await inventoryRepository.getMarketInventorySummary(marketId);
    
    // Process summary into a map for easier frontend consumption
    const processed = summary.reduce((acc, item) => {
      if (!acc[item.productName]) {
          acc[item.productName] = { in: 0, out: 0, balance: 0 };
      }
      if (item.movementType === 'INBOUND' || item.movementType === 'STOCK_IN') {
          acc[item.productName].in += item._sum.quantity;
      } else {
          acc[item.productName].out += item._sum.quantity;
      }
      acc[item.productName].balance = acc[item.productName].in - acc[item.productName].out;
      return acc;
    }, {});

    return processed;
  }
};
