const { NotFoundError } = require("../errors/app.errors");
const deliveryService = require("../services/delivery.service");
const { asyncHandler, ApiResponse } = require("../utils");

module.exports = {
  getDeliveries: asyncHandler(async (req, res) => {
    const result = await deliveryService.getDeliveryList(req.query);
    res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        success: true,
        data: result.deliveries,
        pagination: result.pagination,
        message: "Deliveries fetched successfully"
      })
    );
  }),
  
  getDeliveryDetails: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await deliveryService.getDeliveryDetailsById(id);
    
    if (!result) {
      throw new NotFoundError("Delivery not found");
    }    
    res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        success: true,
        data: result,
        message: "Delivery details fetched successfully"
      })
    );
  }),

  createDelivery: asyncHandler(async (req, res) => {
    const staffId = req.user.id;
    const newDelivery = await deliveryService.createDelivery(req.body, staffId);
    
    res.status(201).json(
      new ApiResponse({
        statusCode: 201,
        success: true,
        data: newDelivery,
        message: "Delivery recorded successfully"
      })
    );
  }),

  editDelivery: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const existingDelivery = await deliveryService.getDeliveryDetailsById(id);
    if (!existingDelivery) {
      throw new NotFoundError("Delivery not found");
    }

    const updatedDelivery = await deliveryService.editDelivery(id, updateData);

    res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        success: true,
        data: updatedDelivery,
        message: "Delivery updated successfully"
      })
    );
  })
};
