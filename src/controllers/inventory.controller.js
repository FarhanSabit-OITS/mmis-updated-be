const inventoryService = require('../services/inventory.service');
const { ApiResponse, asyncHandler } = require('../utils');

module.exports = {
  recordMovement: asyncHandler(async (req, res) => {
    const movement = await inventoryService.recordMovement(req.body, req.user?.id);
    return res.status(201).json(new ApiResponse({
      statusCode: 201,
      success: true,
      data: movement,
      message: "Stock movement recorded successfully"
    }));
  }),

  getMarketMovements: asyncHandler(async (req, res) => {
    const data = await inventoryService.getMarketMovements(req.params.marketId, req.query);
    return res.status(200).json(new ApiResponse({
      statusCode: 200,
      success: true,
      data: data.movements,
      pagination: data.pagination,
      message: "Market movements fetched successfully"
    }));
  }),

  getMarketStockSummary: asyncHandler(async (req, res) => {
    const summary = await inventoryService.getMarketStockSummary(req.params.marketId);
    return res.status(200).json(new ApiResponse({
      statusCode: 200,
      success: true,
      data: summary,
      message: "Market stock summary fetched successfully"
    }));
  })
};
