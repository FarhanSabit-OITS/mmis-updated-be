const marketService = require("../services/market.service");
const { ApiResponse } = require("../utils");

module.exports = {
  createMarket: async (req, res) => {
    const market = await marketService.createMarket(req.body);
    return new ApiResponse({
        statusCode: 201,
        success: true,
        data: market,
        message: "Market is created successfully"
    })
  },

  updateGeneralInfo: async (req, res) => {
    const market = await marketService.updateGeneralInfo(req.params.marketId, req.body);
    return new ApiResponse({
        statusCode: 200,
        success: true,
        data: market,
        message: "Market's general info is updated successfully"
    })
  },

  updateOperatingInfo: async (req, res) => {
    const market = await marketService.updateOperatingInfo(req.params.marketId, req.body);
    return new ApiResponse({
        statusCode: 200,
        success: true,
        data: market,
        message: "Market's operating info is updated successfully"
    })
  },

  updateCapacityInfo: async (req, res) => {
    const market = await marketService.updateCapacityInfo(req.params.marketId, req.body);
    return new ApiResponse({
        statusCode: 200,
        success: true,
        data: market,
        message: "Market's capacity info is updated successfully"
    })
  },

  getMarket: async (req, res) => {
    const market = await marketService.getMarket(req.params.marketId);
    return new ApiResponse({
        statusCode: 201,
        success: true,
        data: market,
        message: "Market details is fetched successfully"
    })
  },
};