const { NotFoundError } = require("../errors/app.errors");
const gateOperationService = require("../services/gateOperation.service");
const { asyncHandler, ApiResponse } = require("../utils");

module.exports = {
  getGateOperations: asyncHandler(async (req, res) => {
    const result = await gateOperationService.getGateOperationList(req.query);
    res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        success: true,
        data: result.operations,
        pagination: result.pagination,
        message: "Gate operations fetched successfully"
      })
    );
  }),
  
  getGateOperationDetails: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await gateOperationService.getGateOperationDetailsById(id);
    
    if (!result) {
      throw new NotFoundError("Gate operation not found");
    }    
    res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        success: true,
        data: result,
        message: "Gate operation details fetched successfully"
      })
    );
  }),

  createGateOperation: asyncHandler(async (req, res) => {
    const staffId = req.user.id;
    const newOperation = await gateOperationService.createGateOperation(req.body, staffId);
    
    res.status(201).json(
      new ApiResponse({
        statusCode: 201,
        success: true,
        data: newOperation,
        message: "Gate operation recorded successfully"
      })
    );
  })
};
