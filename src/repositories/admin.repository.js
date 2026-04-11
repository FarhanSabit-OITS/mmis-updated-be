const prisma = require('../shared/prisma');

module.exports = {
  findManyAdmins: async (filters) => {
    const { level, marketId } = filters;
    const where = {
      admin: {
        adminLevel: {
          not: 'PSEUDO_MARKET_ADMIN'
        }
      }
    };

    if (level) where.admin.adminLevel = level;
    if (marketId) where.admin.marketScopeId = marketId;

    return await prisma.user.findMany({
      where,
      include: {
        profile: true,
        admin: true,
        userRoles: {
          include: { role: true }
        }
      }
    });
  },

  updateAdminUser: async (id, userData, profileData, adminData) => {
    return await prisma.$transaction(async (tx) => {
      // 1. Update User status
      const user = await tx.user.update({
        where: { id },
        data: userData,
        include: { admin: true, profile: true }
      });

      // 2. Update Profile
      if (profileData && user.profile) {
        await tx.userProfile.update({
          where: { userId: id },
          data: profileData
        });
      }

      // 3. Update Admin Scope
      if (adminData && user.admin) {
        await tx.admin.update({
          where: { userId: id },
          data: adminData
        });
      }

      return user;
    });
  }
};
