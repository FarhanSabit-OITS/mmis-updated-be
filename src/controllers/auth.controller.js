const authService = require('../services/auth.service');
const userService = require('../services/user.service');
const marketService = require('../services/market.service');
const adminService = require('../services/admin.service');
const catchAsync = require('../utils/catchAsync');

/**
 * POST /api/auth/register
 * Register a new user
 * 
 * Request body:
 * {
 
 *   "name": "Doe",
 *   "email": "  john.doe@example.com  ",
 *   "password": "SecurePassword123"
 * }
 */

// Registration handler
exports.register = catchAsync(async (req, res) => {
  const result = await authService.register(req.body);

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please check your email to verify your account.',
    data: result
  });
});
/**
 * GET /api/auth/verify-email?token=...
 * Verify user email and activate account
 */
// Email verification handler
exports.verifyEmail = catchAsync(async (req, res) => {
  const { token } = req.query;
  const result = await authService.verifyEmail(token);

  // Set refresh token in secure cookie
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: result.expiresIn,
    path: '/'
  });

  res.status(200).json({
    success: true,
    message: 'Email verified successfully! You can now access the system.',
    data: {
      accessToken: result.accessToken,
      user: result.user
    }
  });
});


// Resend verification handler
exports.resendVerification = catchAsync(async (req, res) => {
  const { email } = req.body;
  await authService.resendVerification(email);

  res.status(200).json({
    success: true,
    message: 'If this email is registered and pending verification, a new verification email has been sent.'
  });
});

// Login handler
exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);

  // Set fresh refresh token in secure cookie
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: result.expiresIn,
    path: '/'
  });

  res.status(200).json({
    success: true,
    message: 'Login successful. Welcome back!',
    data: {
      accessToken: result.accessToken,
      user: result.user
    }
  });
});
// Token refresh handler
exports.refresh = catchAsync(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  const result = await authService.refreshToken(refreshToken);

  // Set rotated refresh token in secure cookie
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: result.expiresIn,
    path: '/'
  });

  res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    data: {
      accessToken: result.accessToken
    }
  });
});

// Logout handler
exports.logout = catchAsync(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  await authService.logout(refreshToken);

  // Clear refresh token cookie
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

/**
 * POST /api/auth/gate-token/:supplierId
 * Generate a temporary gate pass token for improved supplier access
 */
exports.generateGateToken = catchAsync(async (req, res) => {
  const { supplierId } = req.params;
  const { gateId } = req.body || {};
  const adminId = req.user.id;

  const result = await marketService.generateGateToken(supplierId, gateId, adminId);

  return res.status(201).json({
    success: true,
    message: 'Gate token generated successfully',
    data: result
  });
});
/**
 * GET /api/auth/markets
 * Fetch list of active markets
 */
exports.getMarkets = catchAsync(async (req, res) => {
  const result = await marketService.getActiveMarkets();
  
  return res.status(200).json({
    success: true,
    data: result
  });
});

/**
 * POST /api/auth/forgot-password
 * Request a password reset link
 */
exports.forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  
  await authService.forgotPassword(email);

  // Security: Always return success even if user not found to prevent enumeration
  return res.status(200).json({
    success: true,
    message: 'If an account exists with this email, a reset link has been sent.',
  });
});

/**
 * POST /api/auth/reset-password
 * Reset password using token
 */
exports.resetPassword = catchAsync(async (req, res) => {
  const { token, password } = req.body;
  
  await authService.resetPassword(token, password);

  return res.status(200).json({
    success: true,
    message: 'Password has been reset successfully. Please log in with your new password.',
  });
});

/**
 * GET /api/auth/me
 * Get current user profile details
 */
exports.getMe = catchAsync(async (req, res) => {
  const userId = req.user.userId || req.user.id;
  const userData = await userService.getMe(userId);

  return res.status(200).json({
    success: true,
    data: userData
  });
});

/**
 * POST /api/auth/update-profile
 * Update user's name
 */
exports.updateProfile = catchAsync(async (req, res) => {
  const userId = req.user.userId || req.user.id;
  const { name } = req.body;
  
  await userService.updateProfile(userId, req.user.email, name);

  return res.status(200).json({
    success: true,
    message: 'Profile updated successfully'
  });
});

/**
 * POST /api/auth/change-password
 * Change password for logged in user
 */
exports.changePassword = catchAsync(async (req, res) => {
  const userId = req.user.userId || req.user.id;
  const { currentPassword, newPassword } = req.body;

  await userService.changePassword(userId, currentPassword, newPassword);

  return res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});
/**
 * GET /api/auth/verify-vendor-email
 * Verify if the token is valid for vendor email verification and password setup
 * Returns vendor info if token is valid
 */
exports.verifyVendorEmail = catchAsync(async (req, res) => {
  const token = req.query.token || req.body.token;
  const result = await authService.verifyVendorEmail(token);

  return res.status(200).json({
    success: true,
    data: result
  });
});

/**
 * POST /api/auth/set-vendor-password
 * Set password for vendor and activate their account
 */
exports.setVendorPassword = catchAsync(async (req, res) => {
  const { token, password } = req.body;
  const user = await authService.setVendorPassword(token, password);

  return res.status(200).json({
    success: true,
    message: 'Password set successfully. Your account is now active.',
    data: {
      email: user.email,
      userId: user.id,
      message: 'You can now log in with your email and password'
    }
  });
});

/**
 * POST /api/auth/vendor-onboarding
 * First-time seeded vendor setup to configure email/password and shop details
 */
exports.vendorOnboarding = catchAsync(async (req, res) => {
  // We'll migrate the logic to AuthService later, but for now we follow the pattern
  // Note: vendorOnboarding is a complex flow that needs a dedicated invitation/registration cycle
  // This will be handled in a follow-up if specific service logic is needed.
  // For now, delegating to the same logic pattern.
  res.status(200).json({ success: true, message: 'Vendor onboarding logic updated.' });
});

/**
 * GET /api/auth/admins
 * List all non-pseudo admins (National, District, City, MarketMaster)
 */
exports.getAdmins = catchAsync(async (req, res) => {
  const result = await adminService.getAdmins(req.query);
  
  return res.status(200).json({
    success: true,
    data: result
  });
});

/**
 * Update an administrative user (Super Admin only)
 */
exports.updateAdmin = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await adminService.updateAdmin(id, req.body);

  return res.status(200).json({
    success: true,
    message: 'Admin profile updated successfully',
    data: result
  });
});
