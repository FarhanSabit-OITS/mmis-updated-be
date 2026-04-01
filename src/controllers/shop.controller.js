const shopService = require("../services/shop.service");
const { asyncHandler, ApiResponse } = require("../utils");


module.exports = {
  getShops: asyncHandler(async (req, res) => {
    const { shops, total } = await shopService.getShopList(req.query);
    res.json({ data: shops, total });
    
    res.status(200).json(
        new ApiResponse(
            {
                success: true,
                data: shops,
                pagination: {
                    total,
                    page: req.query.page,
                    limit: req.query.limit
                },
                message: "Shop list is fetced successfully"
            }

        )
    )
  }),
};