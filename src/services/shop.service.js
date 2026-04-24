const shopRepo = require("../repositories/shop.repository");

module.exports = {
  getShopList: async (filters) => {
    return await shopRepo.getShopList(filters);
  },
  
  getShopDetailsById: async (shopId) => {
    return await shopRepo.getShopDetailsById(shopId);
  },

  createShop: async (shopData, adminId) => {
    // Add createdById to the payload
    const payload = { ...shopData, createdById: adminId };
    
    // Auto-generate uniqueCode if not provided
    if (!payload.uniqueCode) {
      payload.uniqueCode = `SHP-${Date.now().toString().slice(-6)}-${payload.shopNumber}`;
    }

    return await shopRepo.createShop(payload);
  },

  editShop: async (shopId, updateData) => {
    return await shopRepo.editShop(shopId, updateData);
  },

  deleteShop: async (shopId) => {
    return await shopRepo.deleteShop(shopId);
  }
};