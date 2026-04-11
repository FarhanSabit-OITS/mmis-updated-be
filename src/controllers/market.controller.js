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

  updateGeneralInfo: asyncHandler(
    async (req, res) => {
    const market = await marketService.updateGeneralInfo(req.params.marketId, req.body);
    return res.status(200).json(new ApiResponse({
        statusCode: 200,
        success: true,
        data: market,
        message: "Market's general info is updated successfully"
    }))
  }
  ),

  updateOperatingInfo: asyncHandler(
    async (req, res) => {
    const market = await marketService.updateOperatingInfo(req.params.marketId, req.body);
    return res.status(200).json(new ApiResponse({
        statusCode: 200,
        success: true,
        data: market,
        message: "Market's operating info is updated successfully"
    }))
  }
  ),

  updateCapacityInfo: asyncHandler(
    async (req, res) => {
    const market = await marketService.updateCapacityInfo(req.params.marketId, req.body);
    return res.status(200).json(new ApiResponse({
        statusCode: 200,
        success: true,
        data: market,
        message: "Market's capacity info is updated successfully"
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
        data: result,
        message: "Market list is fetched successfully"
    })
    );
  }
  ),

  addLevel: asyncHandler(async (req, res) => {
    const level = await marketService.addLevel(req.params.marketId, req.body);
    return res.status(201).json(new ApiResponse({
      statusCode: 201,
      success: true,
      data: level,
      message: "Market level added successfully"
    }));
  }),

  addSection: asyncHandler(async (req, res) => {
    const section = await marketService.addSection(req.params.marketId, req.body);
    return res.status(201).json(new ApiResponse({
      statusCode: 201,
      success: true,
      data: section,
      message: "Market section added successfully"
    }));
  }),

  addAisle: asyncHandler(async (req, res) => {
    const aisle = await marketService.addAisle(req.params.sectionId, req.body);
    return res.status(201).json(new ApiResponse({
      statusCode: 201,
      success: true,
      data: aisle,
      message: "Market aisle added successfully"
    }));
  }),

  addGate: asyncHandler(async (req, res) => {
    const gate = await marketService.addGate(req.params.marketId, req.body);
    return res.status(201).json(new ApiResponse({
      statusCode: 201,
      success: true,
      data: gate,
      message: "Market gate added successfully"
    }));
  }),

  getMarketStakeholders: asyncHandler(async (req, res) => {
    const stakeholders = await marketService.getMarketStakeholders(req.params.marketId);
    return res.status(200).json(new ApiResponse({
      statusCode: 200,
      success: true,
      data: stakeholders,
      message: "Market stakeholders fetched successfully"
    }));
  })
};