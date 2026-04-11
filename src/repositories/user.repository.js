const prisma = require('../shared/prisma');

module.exports = {
  findFullProfile: async (userId) => {
    return await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        stakeholder: {
          include: {
            vendor: { include: { primaryMarket: true, facilities: true } },
            supplier: true
          }
        },
        admin: {
          include: {
            marketMaster: { include: { market: true } }
          }
        },
        userRoles: {
          include: { role: true }
        }
      }
    });
  },

  upsertProfile: async (userId, profileData) => {
    return await prisma.userProfile.upsert({
      where: { userId },
      update: profileData,
      create: {
        userId,
        ...profileData
      }
    });
  },

  updateUser: async (userId, data) => {
    return await prisma.user.update({
      where: { id: userId },
      data
    });
  },

  findById: async (userId) => {
    return await prisma.user.findUnique({
      where: { id: userId }
    });
  }
};
