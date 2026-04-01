const { NotFoundError } = require("../errors/app.errors");
const shopService = require("../services/shop.service");
const { asyncHandler, ApiResponse } = require("../utils");


module.exports = {
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
};