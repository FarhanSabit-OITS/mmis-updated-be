const { NotFoundError } = require("../errors/app.errors");
const gateService = require("../services/gate.service");
const { asyncHandler, ApiResponse } = require("../utils");

module.exports = {
  getGates: asyncHandler(async (req, res) => {
    const result = await gateService.getGateList(req.query);
    res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        success: true,
        data: result.gates,
        pagination: result.pagination,
        message: "Gate list fetched successfully"
      })
    );
  }),
  
  getGateDetails: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await gateService.getGateDetailsById(id);
    
    if (!result) {
      throw new NotFoundError("Gate not found");
    }    
    res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        success: true,
        data: result,
        message: "Gate details fetched successfully"
      })
    );
  }),

  createGate: asyncHandler(async (req, res) => {
    const newGate = await gateService.createGate(req.body);
    
    res.status(201).json(
      new ApiResponse({
        statusCode: 201,
        success: true,
        data: newGate,
        message: "Gate created successfully"
      })
    );
  }),

  editGate: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const existingGate = await gateService.getGateDetailsById(id);
    if (!existingGate) {
      throw new NotFoundError("Gate not found");
    }

    const updatedGate = await gateService.editGate(id, updateData);

    res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        success: true,
        data: updatedGate,
        message: "Gate updated successfully"
      })
    );
  }),

  deleteGate: asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const existingGate = await gateService.getGateDetailsById(id);
    if (!existingGate) {
      throw new NotFoundError("Gate not found");
    }

    await gateService.deleteGate(id);

    res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        success: true,
        data: null,
        message: "Gate deleted successfully"
      })
    );
  })
};
