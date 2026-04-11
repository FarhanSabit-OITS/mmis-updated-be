const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/user.repository');
const tokenService = require('./token.service');
const AppError = require('../errors/AppError');
const { validatePassword } = require('../utils/validation');

module.exports = {
  getMe: async (userId) => {
    const user = await userRepository.findFullProfile(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Determine name logic
    const profile = user.profile;
    const fullName = profile
      ? `${profile.firstName} ${profile.lastName}`.trim()
      : user.email.split('@')[0];

    // Format metadata
    let marketName = null;
    let businessId = null;
    let secondaryLabel = 'User';

    if (user.stakeholder?.vendor) {
      marketName = user.stakeholder.vendor.primaryMarket?.name || 'N/A';
      businessId = user.stakeholder.vendor.vendorCode;
      secondaryLabel = `Vendor ID: ${businessId}`;
    } else if (user.admin?.marketMaster) {
      marketName = user.admin.marketMaster.market?.name || 'N/A';
      businessId = user.admin.id;
      secondaryLabel = `Master ID: ${user.admin.adminCode || businessId}`;
    } else if (user.stakeholder?.supplier) {
      businessId = user.stakeholder.supplier.supplierCode;
      secondaryLabel = `Supplier ID: ${businessId}`;
    }

    return {
      id: user.id,
      email: user.email,
      phone: user.phone || profile?.primaryPhone || 'No phone set',
      name: fullName,
      role: user.userRoles[0]?.role?.name || 'Guest',
      kycStatus: user.stakeholder?.kycStatus || 'NOT_SUBMITTED',
      businessId,
      vendorId: user.stakeholder?.vendor?.id || null,
      marketId: user.admin?.marketMaster?.marketId || user.stakeholder?.vendor?.primaryMarketId || null,
      marketName,
      secondaryLabel,
      unitNumber: user.stakeholder?.vendor?.facilities?.[0]?.unitNumber || null,
      facilities: user.stakeholder?.vendor?.facilities || []
    };
  },

  updateProfile: async (userId, userEmail, name) => {
    if (!name || name.trim().split(' ').length < 1) {
      throw new AppError('Please provide a valid name', 400);
    }

    const parts = name.trim().split(' ');
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ') || ' ';

    await userRepository.upsertProfile(userId, {
      firstName,
      lastName,
      primaryPhone: '',
      primaryEmail: userEmail
    });
  },

  changePassword: async (userId, currentPassword, newPassword) => {
    if (!currentPassword || !newPassword) {
      throw new AppError('Current and new passwords are required', 400);
    }

    const user = await userRepository.findById(userId);
    if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
      throw new AppError('Incorrect current password', 401);
    }

    if (!validatePassword(newPassword)) {
      throw new AppError('New password does not meet requirements (8-64 characters)', 400);
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await userRepository.updateUser(userId, {
      passwordHash,
      lastPasswordChange: new Date()
    });
  }
};
