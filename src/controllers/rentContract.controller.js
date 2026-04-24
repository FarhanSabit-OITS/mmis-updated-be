const { NotFoundError } = require("../errors/app.errors");
const rentContractService = require("../services/rentContract.service");
const { asyncHandler, ApiResponse } = require("../utils");

module.exports = {
  getRentContracts: asyncHandler(async (req, res) => {
    const result = await rentContractService.getRentContractList(req.query);
    res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        success: true,
        data: result.contracts,
        pagination: result.pagination,
        message: "Rent contracts fetched successfully"
      })
    );
  }),
  
  getRentContractDetails: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await rentContractService.getRentContractDetailsById(id);
    
    if (!result) {
      throw new NotFoundError("Rent contract not found");
    }    
    res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        success: true,
        data: result,
        message: "Rent contract details fetched successfully"
      })
    );
  }),

  createRentContract: asyncHandler(async (req, res) => {
    const staffId = req.user.id;
    const newContract = await rentContractService.createRentContract(req.body, staffId);
    
    res.status(201).json(
      new ApiResponse({
        statusCode: 201,
        success: true,
        data: newContract,
        message: "Rent contract created successfully"
      })
    );
  }),

  editRentContract: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const existingContract = await rentContractService.getRentContractDetailsById(id);
    if (!existingContract) {
      throw new NotFoundError("Rent contract not found");
    }

    const updatedContract = await rentContractService.editRentContract(id, updateData);

    res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        success: true,
        data: updatedContract,
        message: "Rent contract updated successfully"
      })
    );
  }),

  deleteRentContract: asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const existingContract = await rentContractService.getRentContractDetailsById(id);
    if (!existingContract) {
      throw new NotFoundError("Rent contract not found");
    }

    await rentContractService.deleteRentContract(id);

    res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        success: true,
        data: null,
        message: "Rent contract terminated successfully"
      })
    );
  })
};
