const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const CityRepository = {
  async getAll() {
    return prisma.city.findMany({
        select: {
        id: true,
        name: true,
        cityType: true,
      },
      
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  async getById(id) {
    return prisma.city.findUnique({
      where: { id },
      include: {
        district: true,
        markets: true,
      },
    });
  },
};

module.exports = {
  CityRepository,
};