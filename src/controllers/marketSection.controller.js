const service = require("../services/marketSection.service");
const { ApiResponse } = require("../utils");
const { createMarketSectionSchema, updateMarketSectionSchema } = require("../validations/marketSection.validation");


const create = async (req, res) => {
  try {
    const data = createMarketSectionSchema.parse(req.body);
    const result = await service.createSection(data);
    res.status(201).json(
        new ApiResponse({
            statusCode: 201,
            success: true,
            message: "All market section is created successfully",
            data: result
        })
    );
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getAll = async (req, res) => {
  const result = await service.getSections();
  res.status(200).json(
        new ApiResponse({
            statusCode: 201,
            success: true,
            message: "All market sections is fetched successfully",
            data: result
        })
    );
};

const getById = async (req, res) => {
  try {
    const result = await service.getSectionById(req.params.id);
    res.status(200).json(
        new ApiResponse({
            statusCode: 200,
            success: true,
            message: "market section is fetched successfully",
            data: result
        })
    );
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const data = updateMarketSectionSchema.parse(req.body);
    const result = await service.updateSection(req.params.id, data);
    res.status(200).json(
        new ApiResponse({
            statusCode: 200,
            success: true,
            message: "All market section is created successfully",
            data: result
        })
    );
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const remove = async (req, res) => {
  await service.deleteSection(req.params.id);
  res.status(200).json(
        new ApiResponse({
            statusCode: 200,
            success: true,
            message: "market section is deleted successfully",
        })
    );
};

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove
};