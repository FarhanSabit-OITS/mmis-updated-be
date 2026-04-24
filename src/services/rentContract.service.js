const rentContractRepo = require("../repositories/rentContract.repository");

module.exports = {
  getRentContractList: async (filters) => {
    return await rentContractRepo.getRentContractList(filters);
  },
  
  getRentContractDetailsById: async (contractId) => {
    return await rentContractRepo.getRentContractDetailsById(contractId);
  },

  createRentContract: async (contractData, staffId) => {
    const payload = { ...contractData, createdById: staffId };
    
    if (!payload.contractNumber) {
      payload.contractNumber = `RC-${Date.now().toString().slice(-8)}`;
    }

    return await rentContractRepo.createRentContract(payload);
  },

  editRentContract: async (contractId, updateData) => {
    return await rentContractRepo.editRentContract(contractId, updateData);
  },

  deleteRentContract: async (contractId) => {
    return await rentContractRepo.deleteRentContract(contractId);
  }
};
