const stallRepo = require("../repositories/stall.repository");

module.exports = {
  getStallList: async (filters) => {
    return await stallRepo.getStallList(filters);
  },
  
  getStallDetailsById: async (stallId) => {
    return await stallRepo.getStallDetailsById(stallId);
  },

  createStall: async (stallData, adminId) => {
    const payload = { ...stallData, createdById: adminId };
    
    if (!payload.uniqueCode) {
      payload.uniqueCode = `STL-${Date.now().toString().slice(-6)}-${payload.stallNumber}`;
    }

    return await stallRepo.createStall(payload);
  },

  editStall: async (stallId, updateData) => {
    return await stallRepo.editStall(stallId, updateData);
  },

  deleteStall: async (stallId) => {
    return await stallRepo.deleteStall(stallId);
  }
};
