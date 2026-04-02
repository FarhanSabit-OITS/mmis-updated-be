const { ConflictError } = require("../errors/app.errors");
const marketRepository = require("../repositories/market.repository");

module.exports = {
  createMarket: async (data) => {
    const existingMarket = await marketRepository.findMarketByName(data.name)
    if (existingMarket){
        throw new ConflictError("Market already exists")
    }
    return await marketRepository.createMarket(data);
  },

  updateGeneralInfo: async (marketId, data) => {
    return await marketRepository.updateMarket(marketId, data);
  },

  updateOperatingInfo: async (marketId, data) => {
    return await marketRepository.updateMarket(marketId, data);
  },

  updateCapacityInfo: async (marketId, data) => {
    return await marketRepository.updateMarket(marketId, data);
  },

  getMarket: async (marketId) => {
    return await marketRepository.getMarketById(marketId);
  },
  getMarketList: async (query) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;

    return await marketRepository.getMarketList({
      page,
      limit,
      search: query.search,
      cityId: query.cityId,
    });
    
  }
  
};