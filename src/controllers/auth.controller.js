const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { sendVerificationEmail } = require('../services/email.service');
const {
  validateEmail,
  validatePassword,
  normalizeEmail,
  normalizeName,
} = require('../utils/validation');


const prisma = new PrismaClient();

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

//new code with only name no first and last name
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, businessName } = req.body;
    // const { firstName, lastName, email, password } = req.body;

    // Validate all fields are present
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, email, password',
      });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    // Validate password length (8-64 characters)
    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be between 8 and 64 characters',
      });
    }

    // Normalize inputs
    const normalizedEmail = normalizeEmail(email);
    const normalizedName = normalizeName(name);

    //  Check email uniqueness
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Find Guest role
    const guestRole = await prisma.role.findUnique({
      where: { name: 'Guest' },
    });
    if (!guestRole) {
      console.error('Guest role not found in database');
      return res.status(500).json({
        success: false,
        message: 'Service temporarily unavailable. Please try again later.',
      });
    }

    // Hash password with bcrypt (10 rounds) and Generate verification token (32 bytes = 64 hex characters)
    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create User and Invitation in a transaction
    const result = await prisma.$transaction(
      async (tx) => {
        // Create user with PENDING status and emailVerified = false
        const user = await tx.user.create({
          data: {
            email: normalizedEmail,
            passwordHash,
            status: 'PENDING',
            emailVerified: false,
            // Relate to Guest role
            userRoles: {
              create: {
                roleId: guestRole.id,
              },
            },
          },
          include: {
            userRoles: {
              include: {
                role: true,
              },
            },
          },
        });

        // Create verification invitation
        const invitation = await tx.invitation.create({
          data: {
            email: normalizedEmail,
            token: verificationToken,
            invitationType: 'USER_REGISTRATION',
            status: 'PENDING',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            metadata: {
              purpose: 'VERIFY_EMAIL',
              targetRole: role || 'Guest',
              businessName: businessName || name, // Fallback to user name if not provided
            },
          },
        });

        return { user, invitation };
      },
      {
        timeout: 10000, // 10 secs
      }
    );

    // Build verification link
    const baseUrl = process.env.APP_URL || 'http://localhost:3000';

    const verificationLink = `${baseUrl}/api/auth/verify-email?token=${verificationToken}`;

    // send verification email
    // Build verification link and send email
    const frontendBase = process.env.FRONTEND_URL || 'http://localhost:3000';
    // Point to frontend verify page instead of backend endpoint
    const verifyUrl = `${frontendBase}/verify-email?token=${encodeURIComponent(verificationToken)}`;

    try {
      await sendVerificationEmail(
        normalizedEmail,
        verifyUrl,
        { name: normalizedName } // optional, if your service supports it
      );
    } catch (mailErr) {
      console.error('Verification email failed to send:', mailErr);

    }


    // Respond with success
    return res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      data: {
        user: {
          id: result.user.id,
          email: result.user.email,
          status: result.user.status,
          emailVerified: result.user.emailVerified,
          role: result.user.userRoles[0]?.role?.name || 'Guest',
        },
        verificationTokenExpiresIn: '24 hours',
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.',
    });
    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.',
    });
  }
};
/**
 * GET /api/auth/verify-email?token=...
 * Verify user email and activate account
 */
exports.verifyEmail = async (req, res) => {
  try {
    const token = req.query.token || req.body.token;

    // Check token is provided
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required',
      });
    }

    // Find invitation by token
    const invitation = await prisma.invitation.findUnique({
      where: { token },
    });
    if (!invitation) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification link',
      });
    }

    // Check status is PENDING (not already used)
    if (invitation.status !== 'PENDING') {
      if (invitation.status === 'ACCEPTED') {
        return res.status(400).json({
          success: false,
          message: 'This verification link has already been used',
        });
      }
      return res.status(400).json({
        success: false,
        message: 'This verification link is no longer valid',
      });
    }

    // Check expiration
    if (invitation.expiresAt <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'This verification link has expired. Please request a new verification link.',
        code: 'TOKEN_EXPIRED',
        resendUrl: '/api/auth/resend-verification',
      });
    }

    // Verify purpose (safety check)
    if (invitation.metadata?.purpose !== 'VERIFY_EMAIL') {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification link',
      });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: invitation.email },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });
    if (!user) {
      // Data mismatch error 
      console.error(`User not found for email: ${invitation.email}`);
      return res.status(400).json({
        success: false,
        message: 'User account not found',
      });
    }

    // Determine Target Role and Update
    let targetRoleName = 'Guest';
    let targetBusinessName = user.profile?.firstName || 'Business';

    if (user.email.endsWith('@mms.ug')) {
      targetRoleName = 'MarketMaster';
    } else if (invitation.metadata?.targetRole) {
      const requestedRole = invitation.metadata.targetRole;
      if (['Vendor', 'Supplier'].includes(requestedRole)) {
        targetRoleName = requestedRole;
        targetBusinessName = invitation.metadata.businessName || user.email;
      }
    }

    // Update user and invitation in transaction
    await prisma.$transaction(
      async (tx) => {
        // Update user: set emailVerified = true and status = ACTIVE
        await tx.user.update({
          where: { id: user.id },
          data: {
            emailVerified: true,
            status: 'ACTIVE',
          },
        });

        // Update invitation: set status = ACCEPTED
        await tx.invitation.update({
          where: { id: invitation.id },
          data: {
            status: 'ACCEPTED',
            acceptedAt: new Date(),
            acceptedByUserId: user.id,
          },
        });

        // If target role is different from Guest, process role change
        if (targetRoleName !== 'Guest') {
          // Find or Create Role
          let newRole = await tx.role.findUnique({ where: { name: targetRoleName } });

          if (!newRole) {
            let level = null;
            if (targetRoleName === 'MarketMaster') level = 'MARKET_MASTER';

            newRole = await tx.role.create({
              data: {
                name: targetRoleName,
                description: `Auto-created ${targetRoleName} role`,
                level,
              }
            });
          }

          // Remove existing Guest role
          await tx.userRole.deleteMany({ where: { userId: user.id } });

          // Assign new Role
          await tx.userRole.create({
            data: {
              userId: user.id,
              roleId: newRole.id,
            }
          });

          // Create Specific Entities
          if (targetRoleName === 'MarketMaster') {
            const admin = await tx.admin.create({
              data: {
                userId: user.id,
                adminLevel: 'MARKET_MASTER',
                notes: 'Auto-promoted via email domain',
              }
            });
            // MarketMaster record requires marketID, skipping for now as per plan constraints
          } else if (targetRoleName === 'Vendor') {
            const stakeholder = await tx.stakeholder.create({
              data: {
                userId: user.id,
                stakeholderType: 'VENDOR',
                kycStatus: 'NOT_SUBMITTED',
              }
            });
            const uniqueSuffix = crypto.randomBytes(4).toString('hex').toUpperCase();
            await tx.vendor.create({
              data: {
                stakeholderId: stakeholder.id,
                vendorCode: `VND-${uniqueSuffix}`,
                businessName: targetBusinessName,
                vatRegistered: false,
              }
            });
          } else if (targetRoleName === 'Supplier') {
            const stakeholder = await tx.stakeholder.create({
              data: {
                userId: user.id,
                stakeholderType: 'SUPPLIER',
                kycStatus: 'NOT_SUBMITTED',
              }
            });
            const uniqueSuffix = crypto.randomBytes(4).toString('hex').toUpperCase();
            await tx.supplier.create({
              data: {
                stakeholderId: stakeholder.id,
                supplierCode: `SUP-${uniqueSuffix}`,
                businessName: targetBusinessName,
                supplierType: 'WHOLESALER',
              }
            });
          }
        }
      },
      {
        timeout: 20000,
      }
    );

    // Fetch updated user with new roles
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { userRoles: { include: { role: true } } }
    });

    // Fallback if no roles, though unlikely
    const userRole = updatedUser.userRoles[0];
    const roleName = userRole?.role?.name || 'Guest';
    const roleLevel = userRole?.role?.level || null;

    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        roleName,
        roleLevel,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' }
    );

    // Generate Refresh Token
    const refreshToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        type: 'refresh',
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
    );

    const refreshTokenExpiryDays = process.env.REFRESH_TOKEN_EXPIRY?.includes('d')
      ? parseInt(process.env.REFRESH_TOKEN_EXPIRY)
      : 7;
    const refreshTokenExpiresAt = new Date(Date.now() + refreshTokenExpiryDays * 24 * 60 * 60 * 1000);

    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    const sessionToken = crypto.randomBytes(32).toString('hex');
    await prisma.userSession.create({
      data: {
        userId: user.id,
        sessionToken,
        refreshToken: refreshTokenHash,
        expiresAt: refreshTokenExpiresAt,
        isActive: true,
      },
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: refreshTokenExpiryDays * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully. Logging you in...',
      data: {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          role: roleName,
          status: 'ACTIVE',
        },
      },
    });
  } catch (err) {
    console.error('Verify email error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.',
    });
  }
};
/**
 * POST /api/auth/resend-verification
 * Body: { "email": "user@example.com" }
 * - Only for users with status=PENDING and emailVerified=false
 * - Rate limited: 1/min, 5/day
 */
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    // Basic input validation
    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'A valid email is required',
      });
    }

    const normalizedEmail = normalizeEmail(email);

    // Look up user (avoid enumeration but still enforce correct states)
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Respond generically if user not found
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          'If this email is registered and pending verification, a new verification email has been sent.',
      });
    }

    // Must be pending + unverified to resend
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified.',
      });
    }
    if (user.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message:
          'Account is not in a pending state. Please contact support if you believe this is an error.',
      });
    }

    // Simple rate limits: 1/min & 5/day
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [minuteCount, dayCount] = await Promise.all([
      prisma.invitation.count({
        where: {
          email: normalizedEmail,
          invitationType: 'USER_REGISTRATION',
          createdAt: { gte: oneMinuteAgo },
        },
      }),
      prisma.invitation.count({
        where: {
          email: normalizedEmail,
          invitationType: 'USER_REGISTRATION',
          createdAt: { gte: oneDayAgo },
        },
      }),
    ]);

    if (minuteCount > 0) {
      return res.status(429).json({
        success: false,
        message: 'Please wait at least 1 minute before requesting again.',
      });
    }
    if (dayCount >= 5) {
      return res.status(429).json({
        success: false,
        message:
          'Daily resend limit reached. Please try again tomorrow or contact support.',
      });
    }

    // Invalidate any prior PENDING invites (optional but recommended)
    await prisma.invitation.updateMany({
      where: {
        email: normalizedEmail,
        invitationType: 'USER_REGISTRATION',
        status: 'PENDING',
      },
      data: { status: 'CANCELLED' }, // ensure your enum includes CANCELLED
    });

    // Create a fresh token + invitation
    const token = crypto.randomBytes(32).toString('hex');
    await prisma.invitation.create({
      data: {
        email: normalizedEmail,
        token,
        invitationType: 'USER_REGISTRATION',
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
        metadata: { purpose: 'VERIFY_EMAIL', reason: 'RESEND' },
      },
    });

    // Send email
    const frontendBase = process.env.FRONTEND_URL || 'http://localhost:3000';
    // Point to frontend verify page instead of backend endpoint
    const verifyUrl = `${frontendBase}/verify-email?token=${encodeURIComponent(
      token
    )}`;

    try {
      await sendVerificationEmail(normalizedEmail, verifyUrl, {
        firstName: user.profile?.firstName || user.firstName || 'there',
        lastName: user.profile?.lastName || user.lastName || '',
      });
    } catch (mailErr) {
      console.error('Resend verification email failed:', mailErr);
      // Still respond generically to avoid enumeration
    }

    return res.status(200).json({
      success: true,
      message:
        'If this email is registered and pending verification, a new verification email has been sent.',
    });
  } catch (err) {
    console.error('Resend verification error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.',
    });
  }
};

/**
 * POST /api/auth/login
 * User login with email and password
 * 
 * Request body:
 * {
 *   "email": "john.doe@example.com",
 *   "password": "SecurePassword123"
 * }
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    //  Normalize email
    const normalizedEmail = normalizeEmail(email);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    // Generic message to prevent email enumeration
    if (!user || !user.passwordHash) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in',
      });
    }

    //  Check if account is active
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Your account is not active. Please contact support.',
      });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Get user's primary role
    const userRole = user.userRoles[0];
    const roleName = userRole?.role?.name || 'Guest';
    const roleLevel = userRole?.role?.level || null;

    // Generate Access Token (short-lived)
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        roleName,
        roleLevel,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' }
    );

    // Generate Refresh Token (long-lived)
    const refreshToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        type: 'refresh',
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
    );

    // Calculate refresh token expiration time
    const refreshTokenExpiryDays = process.env.REFRESH_TOKEN_EXPIRY?.includes('d')
      ? parseInt(process.env.REFRESH_TOKEN_EXPIRY)
      : 7;
    const refreshTokenExpiresAt = new Date(Date.now() + refreshTokenExpiryDays * 24 * 60 * 60 * 1000);

    // Hash the refresh token for database storage
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    // Create/update UserSession (for multi-device support)
    const sessionToken = crypto.randomBytes(32).toString('hex');
    await prisma.userSession.create({
      data: {
        userId: user.id,
        sessionToken,
        refreshToken: refreshTokenHash,
        expiresAt: refreshTokenExpiresAt,
        isActive: true,
      },
    });

    //  Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLogin: new Date(),
      },
    });

    // Set refresh token as HTTP-only cookie (for frontend)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: refreshTokenExpiryDays * 24 * 60 * 60 * 1000, // milliseconds
      path: '/',
    });

    // Respond with access token and user data
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          role: roleName,
          status: user.status,
          emailVerified: user.emailVerified
        },
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.',
    });
  }
};
/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token from cookie
 * 
 * Request: No body needed (refresh token comes from HTTP-only cookie)
 * Response: New access token
 */
exports.refresh = async (req, res) => {
  try {
    // Get refresh token from cookie
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not found. Please log in again.',
      });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'your-secret-key');
    } catch (err) {
      console.error('Refresh token verification error:', err.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token. Please log in again.',
      });
    }

    // Find active session with this refresh token
    const session = await prisma.userSession.findUnique({
      where: { refreshToken },
    });

    if (!session || !session.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Session is not active. Please log in again.',
      });
    }

    // Check if session has expired
    if (session.expiresAt <= new Date()) {
      // Invalidate session
      await prisma.userSession.update({
        where: { id: session.id },
        data: { isActive: false, logoutReason: 'Token expired' },
      });
      return res.status(401).json({
        success: false,
        message: 'Refresh token has expired. Please log in again.',
      });
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Check if account is still active
    if (user.status !== 'ACTIVE') {
      await prisma.userSession.update({
        where: { id: session.id },
        data: { isActive: false, logoutReason: 'Account inactive' },
      });
      return res.status(403).json({
        success: false,
        message: 'Your account is not active.',
      });
    }

    // Get user's primary role
    const userRole = user.userRoles[0];
    const roleName = userRole?.role?.name || 'Guest';
    const roleLevel = userRole?.role?.level || null;

    // Generate new access token
    const newAccessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        roleName,
        roleLevel,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' }
    );

    // Update session last activity
    await prisma.userSession.update({
      where: { id: session.id },
      data: { lastActivity: new Date() },
    });

    return res.status(200).json({
      success: true,
      message: 'Access token refreshed successfully',
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (err) {
    console.error('Refresh token error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.',
    });
  }
};

/**
 * POST /api/auth/logout
 * Logout user and invalidate refresh token
 * 
 * Request: No body needed (refresh token comes from HTTP-only cookie)
 * Response: Success message
 */
exports.logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      // Invalidate the session
      await prisma.userSession.updateMany({
        where: { refreshToken },
        data: {
          isActive: false,
          logoutReason: 'User initiated logout',
          loggedOutAt: new Date(),
        },
      });
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.',
    });
  }
};

/**
 * POST /api/auth/gate-token/:supplierId
 * Generate a temporary gate pass token for improved supplier access
 */
exports.generateGateToken = async (req, res) => {
  try {
    const { supplierId } = req.params;
    const { gateId } = req.body || {};
    const adminId = req.user.id;

    if (!gateId) {
      return res.status(400).json({
        success: false,
        message: 'Gate ID is required',
      });
    }

    // 1. Verify Gate exists and get Market details
    const gate = await prisma.marketGate.findUnique({
      where: { id: gateId },
      include: { market: true },
    });

    if (!gate) {
      return res.status(404).json({
        success: false,
        message: 'Gate not found',
      });
    }

    // 2. Find Supplier (by UUID or Code) and their linked User
    let supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
      include: { stakeholder: true },
    });

    if (!supplier) {
      // Try finding by code
      supplier = await prisma.supplier.findUnique({
        where: { supplierCode: supplierId },
        include: { stakeholder: true },
      });
    }

    if (!supplier) {
      // Try finding by Linked User ID
      // The input might be the User ID of the supplier
      supplier = await prisma.supplier.findFirst({
        where: {
          stakeholder: {
            userId: supplierId
          }
        },
        include: { stakeholder: true }
      });
    }



    let supplierUserId;
    let supplierData = {};

    if (supplier) {
      if (!supplier.stakeholder || !supplier.stakeholder.userId) {
        return res.status(400).json({
          success: false,
          message: 'Supplier is not linked to a valid user account',
        });
      }
      supplierUserId = supplier.stakeholder.userId;
      supplierData = {
        id: supplier.id,
        code: supplier.supplierCode,
        name: supplier.businessName
      };
    } else {
      // Fallback: Check if input is a valid User ID directly
      // This allows generating tokens for regular users/members/customers
      const user = await prisma.user.findUnique({
        where: { id: supplierId },
        include: { profile: true }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Supplier or User not found',
        });
      }

      supplierUserId = user.id;
      supplierData = {
        id: user.id,
        code: 'GENERIC_USER', // Placeholder
        name: user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user.email
      };
    }

    // 3. Generate Token Code: SUP_{MKT}_{GATE}_{RAND}
    const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 chars
    const tokenCode = `SUP_${gate.market.uniqueCode}_${gate.gateNumber}_${randomSuffix}`;

    // 4. Calculate Expiry (End of Day)
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setHours(23, 59, 59, 999);

    // 5. Create MarketToken
    const token = await prisma.marketToken.create({
      data: {
        tokenCode,
        tokenType: 'GATE_ENTRY',
        status: 'PENDING',
        marketId: gate.marketId,
        gateId: gate.id,
        userId: supplierUserId,
        createdById: adminId,
        expiresAt,
        metadata: {
          supplierId: supplierData.id,
          supplierCode: supplierData.code,
          generatedBy: 'API',
          isGenericUser: !supplier
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Gate token generated successfully',
      data: {
        tokenCode: token.tokenCode,
        expiresAt: token.expiresAt,
        supplier: {
          name: supplierData.name,
          code: supplierData.code,
        },
        gate: {
          name: gate.gateName,
          number: gate.gateNumber,
          market: gate.market.name,
        },
      },
    });

  } catch (err) {
    console.error('Generate Gate Token error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.',
    });
  }
};
