const { NotFoundError } = require("../errors/app.errors");
const supplierService = require("../services/supplier.service");
const { asyncHandler, ApiResponse } = require("../utils");

module.exports = {
  getSuppliers: asyncHandler(async (req, res) => {
    const result = await supplierService.getSupplierList(req.query);
    res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        success: true,
        data: result.suppliers,
        pagination: result.pagination,
        message: "Suppliers fetched successfully"
      })
    );
  }),
  
  getSupplierDetails: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await supplierService.getSupplierDetailsById(id);
    
    if (!result) {
      throw new NotFoundError("Supplier not found");
    }    
    res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        success: true,
        data: result,
        message: "Supplier details fetched successfully"
      })
    );
  }),

  createSupplier: asyncHandler(async (req, res) => {
    const newSupplier = await supplierService.createSupplier(req.body);
    
    res.status(201).json(
      new ApiResponse({
        statusCode: 201,
        success: true,
        data: newSupplier,
        message: "Supplier created successfully"
      })
    );
  }),

  editSupplier: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const existingSupplier = await supplierService.getSupplierDetailsById(id);
    if (!existingSupplier) {
      throw new NotFoundError("Supplier not found");
    }

    const updatedSupplier = await supplierService.editSupplier(id, updateData);

    res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        success: true,
        data: updatedSupplier,
        message: "Supplier updated successfully"
      })
    );
  }),

  deleteSupplier: asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const existingSupplier = await supplierService.getSupplierDetailsById(id);
    if (!existingSupplier) {
      throw new NotFoundError("Supplier not found");
    }

    await supplierService.deleteSupplier(id);

    res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        success: true,
        data: null,
        message: "Supplier deleted successfully"
      })
    );
  })
};
