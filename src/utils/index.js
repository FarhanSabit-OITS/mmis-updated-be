const ApiResponse      = require("./ApiResponse.util");
const asyncHandler     = require("./asyncHandler.util");
const PaginationResponse = require("./Pagination.util");

// ✅ catchAsync is an alias for asyncHandler — both do the same thing.
// Exported here so all controllers use ONE import path: require('../utils')
const catchAsync = require("./catchAsync");

module.exports = {
    asyncHandler,
    catchAsync,       // ← unified export: no more require('../utils/catchAsync')
    ApiResponse,
    PaginationResponse
};