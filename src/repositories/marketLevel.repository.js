const prisma = require("../shared/prisma");


const create = (data) => {
  return prisma.marketLevel.create({ data });
};

const findAll = () => {
  return prisma.marketLevel.findMany({
    include: {
      sections: true
    }
  });
};

const findById = (id) => {
  return prisma.marketLevel.findUnique({
    where: { id },
    include: { sections: true }
  });
};

const update = (id, data) => {
  return prisma.marketLevel.update({
    where: { id },
    data
  });
};

const remove = (id) => {
  return prisma.marketLevel.delete({
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