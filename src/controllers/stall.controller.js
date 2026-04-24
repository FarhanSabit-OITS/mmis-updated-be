const { NotFoundError } = require("../errors/app.errors");
const stallService = require("../services/stall.service");
const { asyncHandler, ApiResponse } = require("../utils");

module.exports = {
  getStalls: asyncHandler(async (req, res) => {
    const result = await stallService.getStallList(req.query);
    res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        success: true,
        data: result.stalls,
        pagination: result.pagination,
        message: "Stall list fetched successfully"
      })
    );
  }),
  
  getStallDetails: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await stallService.getStallDetailsById(id);
    
    if (!result) {
      throw new NotFoundError("Stall not found");
    }    
    res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        success: true,
        data: result,
        message: "Stall details fetched successfully"
      })
    );
  }),

  createStall: asyncHandler(async (req, res) => {
    const adminId = req.user.id;
    const newStall = await stallService.createStall(req.body, adminId);
    
    res.status(201).json(
      new ApiResponse({
        statusCode: 201,
        success: true,
        data: newStall,
        message: "Stall created successfully"
      })
    );
  }),

  editStall: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const existingStall = await stallService.getStallDetailsById(id);
    if (!existingStall) {
      throw new NotFoundError("Stall not found");
    }

    const updatedStall = await stallService.editStall(id, updateData);

    res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        success: true,
        data: updatedStall,
        message: "Stall updated successfully"
      })
    );
  }),

  deleteStall: asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const existingStall = await stallService.getStallDetailsById(id);
    if (!existingStall) {
      throw new NotFoundError("Stall not found");
    }

    await stallService.deleteStall(id);

    res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        success: true,
        data: null,
        message: "Stall deleted successfully"
      })
    );
  })
};
