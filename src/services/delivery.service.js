const deliveryRepo = require("../repositories/delivery.repository");
const { generateUniqueCode } = require("../utils/identifier");

module.exports = {
  getDeliveryList: async (filters) => {
    return await deliveryRepo.getDeliveryList(filters);
  },
  
  getDeliveryDetailsById: async (deliveryId) => {
    return await deliveryRepo.getDeliveryDetailsById(deliveryId);
  },

  createDelivery: async (deliveryData, staffId) => {
    const payload = { ...deliveryData, recordedById: staffId };
    
    // Auto-generate delivery code and receipt number if not present
    if (!payload.deliveryCode) {
        payload.deliveryCode = generateUniqueCode('DELIVERY');
    }
    if (!payload.receiptNumber) {
        payload.receiptNumber = generateUniqueCode('RECEIPT');
    }

    return await deliveryRepo.createDelivery(payload);
  },

  editDelivery: async (deliveryId, updateData) => {
    return await deliveryRepo.editDelivery(deliveryId, updateData);
  }
};
