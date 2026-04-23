const repo = require('../repositories/marketSection.repository')

const createSection = async (data) => {
  return await repo.create(data);
};

const getSections = async () => {
  return await repo.findAll();
};

const getSectionById = async (id) => {
  const section = await repo.findById(id);
  if (!section) throw new Error("Section not found");
  return section;
};

const updateSection = async (id, data) => {
  return await repo.update(id, data);
};

const deleteSection = async (id) => {
  return await repo.remove(id);
};

module.exports = {
  createSection,
  getSections,
  getSectionById,
  updateSection,
  deleteSection
};