const supplierRepo = require("../repositories/supplier.repository");
const { generateUniqueCode } = require("../utils/identifier");

module.exports = {
  getSupplierList: async (filters) => {
    return await supplierRepo.getSupplierList(filters);
  },
  
  getSupplierDetailsById: async (supplierId) => {
    return await supplierRepo.getSupplierDetailsById(supplierId);
  },

  createSupplier: async (supplierData) => {
    const payload = { ...supplierData };
    
    if (!payload.supplierCode) {
      payload.supplierCode = generateUniqueCode('SUPPLIER');
    }

    return await supplierRepo.createSupplier(payload);
  },

  editSupplier: async (supplierId, updateData) => {
    return await supplierRepo.editSupplier(supplierId, updateData);
  },

  deleteSupplier: async (supplierId) => {
    return await supplierRepo.deleteSupplier(supplierId);
  }
};
