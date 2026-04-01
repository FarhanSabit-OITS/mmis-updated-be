const { 
    createMarketSchema, 
    updateCapacitySchema, 
    updateGeneralSchema, 
    updateOperatingSchema,
    getMarketListSchema
} = require("./market.validation");
const { getShopsQuerySchema } = require("./shop.validation");

module.exports = {
    createMarketSchema,
    updateCapacitySchema,
    updateGeneralSchema,
    updateOperatingSchema,
    getMarketListSchema,
    getShopsQuerySchema
}