const gateOperationRepo = require("../repositories/gateOperation.repository");

module.exports = {
  getGateOperationList: async (filters) => {
    return await gateOperationRepo.getGateOperationList(filters);
  },
  
  getGateOperationDetailsById: async (operationId) => {
    return await gateOperationRepo.getGateOperationDetailsById(operationId);
  },

  createGateOperation: async (data, staffId) => {
    const payload = { ...data, recordedById: staffId };
    return await gateOperationRepo.createGateOperation(payload);
  }
};
