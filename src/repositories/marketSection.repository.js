const prisma = require("../prisma");


const create = (data) => {
  return prisma.marketSection.create({ data });
};

const findAll = () => {
  return prisma.marketSection.findMany({
    include: {
      shops: true,
      stalls: true
    }
  });
};

const findById = (id) => {
  return prisma.marketSection.findUnique({
    where: { id }
  });
};

const update = (id, data) => {
  return prisma.marketSection.update({
    where: { id },
    data
  });
};

const remove = (id) => {
  return prisma.marketSection.delete({
    where: { id }
  });
};

module.exports = {
  create,
  findAll,
  findById,
  update,
  remove
};