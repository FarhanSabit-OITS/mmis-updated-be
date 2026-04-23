
const repo = require("../repositories/marketLevel.repository");
const prisma = require("../shared/prisma");

const createLevel = async (data, userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error("User not found");
  }

  return await repo.create({
    ...data,
    createdById: userId
  });
};

const getLevels = async () => {
  return await repo.findAll();
};

const getLevelById = async (id) => {
  const level = await repo.findById(id);
  if (!level) throw new Error("MarketLevel not found");
  return level;
};

const updateLevel = async (id, data) => {
  return await repo.update(id, data);
};

const deleteLevel = async (id) => {
  return await repo.remove(id);
};

module.exports = {
  createLevel,
  getLevels,
  getLevelById,
  updateLevel,
  deleteLevel
};