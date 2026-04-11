const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const authRepository = require('../repositories/auth.repository');
const tokenService = require('./token.service');
const { sendVerificationEmail } = require('./email.service');
const AppError = require('../errors/AppError');
const { normalizeEmail, normalizeName } = require('../utils/validation');

module.exports = {
  register: async (userData) => {
    const { name, email, password, role, marketId, phoneNumber } = userData;

    const normalizedEmail = normalizeEmail(email);
    const normalizedName = normalizeName(name);

    // 1. Check if user already exists
    const existingUser = await authRepository.findUserByEmail(normalizedEmail);
    if (existingUser) {
      throw new AppError('An account with this email already exists.', 409);
    }

    // 2. Resolve Role
    const guestRole = await authRepository.findRoleByName('Guest');
    if (!guestRole) {
      throw new AppError('Service temporarily unavailable (Role configuration error).', 500);
    }

    // 3. Hash Password
    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // 4. Data Preparation
    const createUserDto = {
      email: normalizedEmail,
      passwordHash,
      phone: phoneNumber || null,
      roleId: guestRole.id
    };

    const invitationData = {
      email: normalizedEmail,
      token: verificationToken,
      invitationType: 'USER_REGISTRATION',
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      metadata: {
        purpose: 'VERIFY_EMAIL',
        targetRole: role || 'Guest',
        marketId: marketId,
        name: normalizedName
      }
    };

    // 5. Database Transaction (via Repository)
    const { user, invitation } = await authRepository.createUserWithInvitation(createUserDto, invitationData);

    // 6. Send Email (Fire and forget, but logged)
    const frontendBase = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verifyUrl = `${frontendBase}/verify-email?token=${encodeURIComponent(verificationToken)}`;

    sendVerificationEmail(normalizedEmail, verifyUrl, { name: normalizedName })
      .catch(err => console.error('📧 Email failed to send during registration:', err));

    return {
      user: {
        id: user.id,
        email: user.email,
        status: user.status,
        emailVerified: user.emailVerified,
        role: user.userRoles[0]?.role?.name || 'Guest'
      }
    };
  },

  verifyEmail: async (token) => {
    // 1. Find invitation
    const invitation = await authRepository.findInvitationByToken(token);
    
    if (!invitation || invitation.invitationType !== 'USER_REGISTRATION') {
      throw new AppError('Invalid verification link.', 400);
    }

    if (invitation.status !== 'PENDING') {
      throw new AppError('This verification link has already been used or is invalid.', 400);
    }

    if (invitation.expiresAt < new Date()) {
      throw new AppError('This verification link has expired.', 400);
    }

    // 2. Determine target role
    let targetRoleName = invitation.metadata?.targetRole || 'Guest';
    if (invitation.email.endsWith('@mms.ug')) {
      targetRoleName = 'MarketMaster';
    }

    // 3. Execute completion via Repository (Atomic transaction)
    const result = await authRepository.completeEmailVerification(
      invitation.id, 
      invitation.email, 
      targetRoleName,
      invitation.metadata
    );
    
    if (!result || !result.user) {
      throw new AppError('User account not found or verification failed.', 400);
    }

    const { user } = result;

    // 4. Generate Tokens for Auto-Login
    const roleName = user.userRoles[0]?.role?.name || targetRoleName;
    const tokens = await tokenService.generateTokens(user, roleName);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: roleName,
        status: user.status
      },
      ...tokens
    };
  },

  login: async (email, password) => {
    const normalizedEmail = normalizeEmail(email);

    // 1. Find user
    const user = await authRepository.findUserByEmail(normalizedEmail);
    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    // 2. Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password.', 401);
    }

    // 3. Check account status
    if (user.status === 'BLOCKED') {
      throw new AppError('Your account has been suspended. Please contact support.', 403);
    }

    if (!user.emailVerified) {
      throw new AppError('Please verify your email address before logging in.', 403);
    }

    // 4. Generate Tokens
    const roleName = user.userRoles[0]?.role?.name || 'Guest';
    const tokens = await tokenService.generateTokens(user, roleName);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName}` : user.email,
        role: roleName,
        status: user.status,
        kycStatus: user.stakeholder?.kycStatus || 'NOT_SUBMITTED',
        vendorId: user.stakeholder?.vendor?.id || null,
        supplierId: user.stakeholder?.supplier?.id || null
      },
      ...tokens
    };
  },

  refreshToken: async (token) => {
    // 1. Verify and retrieve user from token/session
    const user = await tokenService.verifyRefreshToken(token);
    if (!user) {
      throw new AppError('Invalid or expired session. Please log in again.', 401);
    }

    // 2. Generate new tokens (rotates both)
    const roleName = user.userRoles[0]?.role?.name || 'Guest';
    const tokens = await tokenService.generateTokens(user, roleName);

    return tokens;
  },

  logout: async (token) => {
    if (!token) return;
    await tokenService.revokeSession(token);
  },

  resendVerification: async (email) => {
    const normalizedEmail = normalizeEmail(email);

    // 1. Find user (avoiding enumeration but enforcing states)
    const user = await authRepository.findUserByEmail(normalizedEmail);
    if (!user) return; // Generic response handled by controller

    if (user.emailVerified) {
      throw new AppError('Email is already verified.', 400);
    }

    if (user.status !== 'PENDING') {
      throw new AppError('Account is not in a pending state.', 400);
    }

    // 2. Check Rate Limits
    const minuteLimit = await authRepository.countRecentInvitations(normalizedEmail, 60 * 1000);
    if (minuteLimit > 0) {
      throw new AppError('Please wait at least 1 minute before requesting again.', 429);
    }

    const dayLimit = await authRepository.countRecentInvitations(normalizedEmail, 24 * 60 * 60 * 1000);
    if (dayLimit >= 5) {
      throw new AppError('Daily resend limit reached. Please try again tomorrow.', 429);
    }

    // 3. Invalidate previous and create new
    await authRepository.invalidatePendingInvitations(normalizedEmail);

    const token = crypto.randomBytes(32).toString('hex');
    await authRepository.createInvitation({
      email: normalizedEmail,
      token,
      invitationType: 'USER_REGISTRATION',
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      metadata: { purpose: 'VERIFY_EMAIL', reason: 'RESEND' }
    });

    // 4. Send Email
    const frontendBase = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verifyUrl = `${frontendBase}/verify-email?token=${encodeURIComponent(token)}`;

    sendVerificationEmail(normalizedEmail, verifyUrl, {
      name: user.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName}` : user.email
    }).catch(err => console.error('📧 Resend email failed:', err));
  },

  forgotPassword: async (email) => {
    const normalizedEmail = normalizeEmail(email);

    // 1. Find user
    const user = await authRepository.findUserByEmail(normalizedEmail);
    // Security: Stop here if user not found to prevent enumeration, return success in controller
    if (!user) return;

    // 2. Create Token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await authRepository.createVerificationToken(user.id, normalizedEmail, token, expiresAt);

    // 3. Send Email
    const { sendPasswordResetEmail } = require('./email.service');
    const frontendBase = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendBase}/reset-password?token=${encodeURIComponent(token)}`;

    sendPasswordResetEmail(normalizedEmail, resetUrl, { name: user.profile?.firstName || 'User' })
      .catch(err => console.error('📧 Password reset email failed:', err));
  },

  resetPassword: async (token, password) => {
    if (!validatePassword(password)) {
      throw new AppError('Password must be between 8 and 64 characters', 400);
    }

    // 1. Verify token
    const verificationToken = await authRepository.findVerificationToken(token);

    if (
      !verificationToken ||
      verificationToken.tokenType !== 'PASSWORD_RESET' ||
      verificationToken.isUsed ||
      verificationToken.expiresAt < new Date()
    ) {
      throw new AppError('Invalid or expired reset link', 400);
    }

    // 2. Hash and Save (using repository transaction)
    const passwordHash = await bcrypt.hash(password, 10);
    await authRepository.resetUserPassword(verificationToken.id, verificationToken.userId, passwordHash);
  },

  verifyVendorEmail: async (token) => {
    const invitation = await authRepository.findInvitationByToken(token);

    if (!invitation || invitation.invitationType !== 'USER_REGISTRATION' || invitation.status !== 'PENDING') {
      throw new AppError('Invalid or expired onboarding link', 400);
    }

    // Return current metadata for UI
    return {
      email: invitation.email,
      name: invitation.metadata?.name,
      businessName: invitation.metadata?.businessName,
      marketId: invitation.metadata?.marketId
    };
  },

  setVendorPassword: async (token, password) => {
    if (!validatePassword(password)) {
      throw new AppError('Password does not meet complexity requirements', 400);
    }

    const invitation = await authRepository.findInvitationByToken(token);
    if (!invitation || invitation.status !== 'PENDING') {
      throw new AppError('Invalid token', 400);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    // Convert generic invitation to active account
    const result = await authRepository.completeEmailVerification(
      invitation.id,
      invitation.email,
      'Vendor',
      invitation.metadata
    );

    // Update the newly created user's password (it was likely empty or temporary)
    await prisma.user.update({
      where: { id: result.user.id },
      data: { passwordHash }
    });

    return result.user;
  }
};
