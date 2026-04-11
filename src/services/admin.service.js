const adminRepository = require('../repositories/admin.repository');
const AppError = require('../errors/AppError');

module.exports = {
  getAdmins: async (filters) => {
    const admins = await adminRepository.findManyAdmins(filters);
    
    return admins.map(a => ({
      id: a.id,
      email: a.email,
      name: `${a.profile?.firstName || ''} ${a.profile?.lastName || ''}`.trim(),
      level: a.admin?.adminLevel,
      status: a.status,
      roles: a.userRoles.map(ur => ur.role.name)
    }));
  },

  updateAdmin: async (id, data) => {
    const { name, status, level, marketId } = data;

    const userData = {};
    if (status) userData.status = status;

    let profileData = null;
    if (name) {
      const parts = name.trim().split(' ');
      profileData = {
        firstName: parts[0] || '',
        lastName: parts.slice(1).join(' ') || ''
      };
    }

    let adminData = null;
    if (level || marketId) {
      adminData = {};
      if (level) adminData.adminLevel = level;
      if (marketId) adminData.marketScopeId = marketId;
    }

    const updatedUser = await adminRepository.updateAdminUser(id, userData, profileData, adminData);
    
    return {
      id: updatedUser.id,
      email: updatedUser.email,
      status: updatedUser.status
    };
  }
};
