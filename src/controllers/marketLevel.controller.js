const service = require("../services/marketLevel.service");
const { ApiResponse } = require("../utils");
const { createMarketLevelSchema, updateMarketLevelSchema } = require("../validations/marketLevel.validation");


const create = async (req, res) => {
  try {
    const data = createMarketLevelSchema.parse(req.body);
    const userId = req.user.userId || req.user.id;
    const result = await service.createLevel(data,userId);
    res.status(201).json(
        new ApiResponse({
            statusCode: 201,
            success: true,
            message: "success",
            data: result
        })
    );
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getAll = async (req, res) => {
  const result = await service.getLevels();
  res.status(200).json(
        new ApiResponse({
            statusCode: 200,
            success: true,
            message: "All market level is fetched successfully",
            data: result
        })
    );
};

const getById = async (req, res) => {
  try {
    const result = await service.getLevelById(req.params.id);
    res.status(200).json(
        new ApiResponse({
            statusCode: 200,
            success: true,
            message: "Market level is fetched successfully",
            data: result
        })
    );
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const data = updateMarketLevelSchema.parse(req.body);
    const result = await service.updateLevel(req.params.id, data);
    res.status(200).json(
        new ApiResponse({
            statusCode: 200,
            success: true,
            message: "All market level is updated successfully",
            data: result
        })
    );
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const remove = async (req, res) => {
  await service.deleteLevel(req.params.id);
  res.status(200).json(
        new ApiResponse({
            statusCode: 200,
            success: true,
            message: "Market level is deleted successfully",
        })
    );
};

const getByMarketId = async (req, res) => {
  try {
    const result = await service.getLevelsByMarketId(req.params.marketId);
    res.status(200).json(
        new ApiResponse({
            statusCode: 200,
            success: true,
            message: "Market levels fetched successfully",
            data: result
        })
    );
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove,
  getByMarketId
};