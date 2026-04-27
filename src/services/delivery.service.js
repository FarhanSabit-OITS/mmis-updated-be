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
  },

  recordGateEntry: async (deliveryId, gateId, officerId) => {
    const delivery = await deliveryRepo.getDeliveryDetailsById(deliveryId);
    if (!delivery) throw new Error("Delivery not found");

    return await deliveryRepo.editDelivery(deliveryId, {
      status: "ARRIVED",
      receivedDate: new Date(),
      metadata: {
        ...delivery.metadata,
        gateId,
        gateOfficerId: officerId,
        arrivalTimestamp: new Date().toISOString()
      }
    });
  },

  verifyAndReceiveStock: async (deliveryId, verificationData, verifierId) => {
    const { items, notes } = verificationData;
    const delivery = await deliveryRepo.getDeliveryDetailsById(deliveryId);
    if (!delivery) throw new Error("Delivery not found");

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update delivery status
      const updatedDelivery = await tx.delivery.update({
        where: { id: deliveryId },
        data: {
          status: "COMPLETED",
          verifiedById: verifierId,
          verificationNotes: notes,
          receivedDate: new Date()
        }
      });

      // 2. Process each item and update product stock
      const productService = require("./product.service");
      for (const item of items) {
        await productService.adjustStock(item.productId, item.quantity, "DELIVERY_RECEIPT", deliveryId, tx);
      }

      return updatedDelivery;
    });

    return result;
  }
};
