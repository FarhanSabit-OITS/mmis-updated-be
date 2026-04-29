const shopRepo = require("../repositories/shop.repository");

module.exports = {
  createShop: async (marketId, createdById, marketMasterId, shopData) => {
    return await shopRepo.create(marketId, createdById, marketMasterId, shopData);
  },

  getShopList: async (filters) => {
    return await shopRepo.getShopList(filters);
  },
  
  getShopDetailsById: async (shopId) => {
    return await shopRepo.getShopDetailsById(shopId);
  },

  editShop: async (shopId, updateData) => {
    return await shopRepo.editShop(shopId, updateData);
  },

  deleteShop: async (shopId) => {
    return await shopRepo.deleteShop(shopId);
  }
};