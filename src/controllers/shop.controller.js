const { NotFoundError } = require("../errors/app.errors");
const shopService = require("../services/shop.service");
const { asyncHandler, ApiResponse } = require("../utils");
const prisma = require("../shared/prisma");


module.exports = {
  createShop: asyncHandler(async (req, res) => {
    const shopData = req.validated;
    const marketId = shopData.marketId;
    const createdById = req.user?.userId || req.user?.id;
    const marketMasterId = req.user?.marketMasterId || null;

    if (!marketId || !createdById) {
      return res.status(400).json(
        new ApiResponse({
          statusCode: 400,
          success: false,
          message: "marketId and createdById are required"
        })
      );
    }

    
    const newShop = await shopService.createShop(marketId, createdById, marketMasterId, { ...shopData });
    res.status(201).json(
      new ApiResponse({
        statusCode: 201,
        success: true,
        data: newShop,
        message: "Shop created successfully"
      })
    );
  }),

  getShops: asyncHandler(async (req, res) => {
    const result = await shopService.getShopList(req.query);
    res.status(200).json(
        new ApiResponse(
            {
                statusCode: 200,
                success: true,
                data: result.shops,
                pagination: result.pagination,
                message: "Shop list is fetced successfully"
            }

        )
    )
  }),
  
  getShopDetails: asyncHandler(async (req, res) => {
    const { id } = req.params;
    console.log("Id ", id)
    const result = await shopService.getShopDetailsById(id);
    
    if (!result) {
        throw new NotFoundError("Shop not found")
    }    
    res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        success: true,
        data: result,
        message: "Shop details fetched successfully"
      })
    );
  }),

  editShop: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const existingShop = await shopService.getShopDetailsById(id);
    if (!existingShop) {
      throw new NotFoundError("Shop not found");
    }

    const updatedShop = await shopService.editShop(id, updateData);

    res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        success: true,
        data: updatedShop,
        message: "Shop updated successfully"
      })
    );
  }),
  deleteShop: asyncHandler(async(req, res)=>{
    const { id } = req.params;
    await shopService.delete(id)
    res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        success: true,
        message: "Shop is deleted successfully"
      })
    )
  })
};