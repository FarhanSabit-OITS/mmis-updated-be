const marketService = require("../services/market.service");
const { ApiResponse, asyncHandler } = require("../utils");


module.exports = {
  createMarket: asyncHandler(
    async (req, res) => {
    const market = await marketService.createMarket(req.body);
    return res.status(200).json(new ApiResponse({
        statusCode: 201,
        success: true,
        data: market,
        message: "Market is created successfully"
    }))
  }
  ),

  updateMarket: asyncHandler(
    async (req, res) => {
    const market = await marketService.updateMarket(req.params.marketId, req.body);
    return res.status(200).json(new ApiResponse({
        statusCode: 200,
        success: true,
        data: market,
        message: "Market is updated successfully"
    }))
  }
  ),

  getMarket: asyncHandler(
    async (req, res) => {
    const market = await marketService.getMarket(req.params.marketId);
    return res.status(200).json(
        new ApiResponse({
        statusCode: 201,
        success: true,
        data: market,
        message: "Market details is fetched successfully"
    })
    )
  }
  ),
  getMarketList: asyncHandler(
    async (req, res) => {
    const result = await marketService.getMarketList(req.query);
    return res.status(200).json(
    new ApiResponse({
        statusCode: 200,
        success: true,
        data: result.markets,
        pagination: result.pagination,
        message: "Market list is fetched successfully"
    })
    );
  }
  ),
  getMarketNameList: asyncHandler(async (req, res)=>{
    const result = await marketService.getMarketNameList()
    return res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        success: true,
        data: result,
        message: "Market list is feched successfully"
      })
    )
  }),
  deleteMarket: asyncHandler(
    async (req, res) => {
    await marketService.deleteMarket(req.params.marketId);
    return res.status(200).json(new ApiResponse({
        statusCode: 200,
        success: true,
        message: "Market is deleted successfully"
    }))
  }
  ),
};