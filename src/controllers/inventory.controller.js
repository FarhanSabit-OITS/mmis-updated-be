const inventoryService = require('../services/inventory.service');
const complianceService = require('../services/compliance.service');
const { ApiResponse, asyncHandler } = require('../utils');

module.exports = {
  recordMovement: asyncHandler(async (req, res) => {
    const movement = await inventoryService.recordMovement(req.body, req.user?.id);
    
    // Fire-and-forget audit log for compliance
    complianceService.logAudit({
        action: 'INVENTORY_MOVEMENT',
        entityType: 'StockMovement',
        entityId: movement.id,
        newData: req.body,
        userId: req.user?.id || req.user?.userId,
        ipAddress: req.ip,
        endpoint: req.originalUrl,
        httpMethod: req.method
    });

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
