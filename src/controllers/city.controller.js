const { CityService } = require("../services/city.service");
const { asyncHandler, ApiResponse } = require("../utils");


const CityController = {
  getAll: asyncHandler(async (req, res, next) => {
    const cities = await CityService.getAllCities();
    return res.status(200).json(
        new ApiResponse({
            statusCode: 200,
            data: cities,
            message: "Cities list have been fetched successfully"
        })
    );
  }),
};

module.exports = {
  CityController,
};