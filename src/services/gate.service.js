const gateRepo = require("../repositories/gate.repository");

module.exports = {
  getGateList: async (filters) => {
    return await gateRepo.getGateList(filters);
  },
  
  getGateDetailsById: async (gateId) => {
    return await gateRepo.getGateDetailsById(gateId);
  },

  createGate: async (gateData) => {
    return await gateRepo.createGate(gateData);
  },

  editGate: async (gateId, updateData) => {
    return await gateRepo.editGate(gateId, updateData);
  },

  deleteGate: async (gateId) => {
    return await gateRepo.deleteGate(gateId);
  }
};
