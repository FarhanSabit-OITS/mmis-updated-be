const shopRepo = require("../repositories/shop.repository");

module.exports = {
  getShopList: async (filters) => {
    return await shopRepo.getShopList(filters);
  },
  
  getShopDetailsById: async (shopId) => {
    return await shopRepo.getShopDetailsById(shopId);
  },

  editShop: async (shopId, updateData) => {
    return await shopRepo.editShop(shopId, updateData);
  },
};