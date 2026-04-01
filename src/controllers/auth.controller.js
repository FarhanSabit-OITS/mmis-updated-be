const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/email.service');
const {
  validateEmail,
  validatePassword,
  normalizeEmail,
  normalizeName,
  validatePhone,
  normalizePhone,
} = require('../utils/validation');


const prisma = require('../prisma');

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
    const { name, email, phone, password, role, businessName, marketId } = req.body;

    // Validate name and password
    if (!name || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name and password are required',
      });
    }

    // Must have either email or phone
    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: 'Email or phone number is required for registration',
      });
    }

    // Role-specific validation for markets
    if (['Vendor', 'Supplier'].includes(role) && !marketId) {
      return res.status(400).json({
        success: false,
        message: 'Market selection is mandatory for Vendors and Suppliers',
      });
    }

    // Validate email if provided
    let normalizedEmail = null;
    if (email) {
      if (!validateEmail(email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format',
        });
      }
      normalizedEmail = normalizeEmail(email);

      // Check email uniqueness
      const existingUserEmail = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
      if (existingUserEmail) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email already exists.',
        });
      }
    }

    // Validate phone if provided
    let normalizedPhone = null;
    if (phone) {
      if (!validatePhone(phone)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid phone format (+256...)',
        });
      }
      normalizedPhone = normalizePhone(phone);

      // Check phone uniqueness
      const existingUserPhone = await prisma.user.findUnique({
        where: { phone: normalizedPhone },
      });
      if (existingUserPhone) {
        return res.status(409).json({
          success: false,
          message: 'An account with this phone number already exists.',
        });
      }
    }

    // Validate password
    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be between 8 and 64 characters',
      });
    }

    const normalizedName = normalizeName(name);

    // Find Guest role
    const guestRole = await prisma.role.findUnique({
      where: { name: 'Guest' },
    });

    if (!guestRole) {
      return res.status(500).json({
        success: false,
        message: 'Service unavailable: default role not found',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Create User and Verification items in transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          phone: normalizedPhone,
          passwordHash,
          status: 'PENDING',
          emailVerified: false,
          phoneVerified: false,
          userRoles: {
            create: { roleId: guestRole.id },
          },
        },
        include: {
          userRoles: {
            include: { role: true },
          },
        },
      });

      // 1. Email Verification Item if email provided
      if (normalizedEmail) {
        await tx.invitation.create({
          data: {
            email: normalizedEmail,
            token: verificationToken,
            invitationType: 'USER_REGISTRATION',
            status: 'PENDING',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            metadata: {
              purpose: 'VERIFY_EMAIL',
              targetRole: role || 'Guest',
              businessName: businessName || name,
              marketId: marketId,
              name: normalizedName,
            },
          },
        });
      }

      // 2. Phone Verification Item if phone provided
      if (normalizedPhone) {
        await tx.verificationToken.create({
          data: {
            token: otp,
            tokenType: 'PHONE_VERIFICATION',
            phone: normalizedPhone,
            userId: user.id,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
          },
        });
      }

      return user;
    });

    // Handle Sends
    let responseMessage = 'Registration successful. ';

    if (normalizedEmail) {
      const frontendBase = process.env.FRONTEND_URL || 'http://localhost:3000';
      const verifyUrl = `${frontendBase}/verify-email?token=${encodeURIComponent(verificationToken)}`;
      try {
        await sendVerificationEmail(normalizedEmail, verifyUrl, { name: normalizedName });
        responseMessage += 'Please check your email to verify your account.';
      } catch (mailErr) {
        console.error('Mail error:', mailErr);
      }
    }

    if (normalizedPhone) {
      // Simulate SMS
      console.log(`[SMS SIMULATION] OTP for ${normalizedPhone}: ${otp}`);
      if (normalizedEmail) {
        responseMessage += ' and check your phone for an OTP.';
      } else {
        responseMessage += 'Please check your phone for a 6-digit OTP code.';
      }
    }

    return res.status(201).json({
      success: true,
      message: responseMessage,
      data: {
        user: {
          id: result.id,
          email: result.email,
          phone: result.phone,
          status: result.status,
          role: result.userRoles[0]?.role?.name || 'Guest',
        },
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
    let marketId = invitation.metadata?.marketId;

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

        // If target role is different from Guest, process registration intent
        if (targetRoleName !== 'Guest') {
          // Create Specific Entities but DO NOT upgrade role yet
          if (targetRoleName === 'Vendor') {
            // Check for existing stakeholder
            let stakeholder = await tx.stakeholder.findUnique({
              where: { userId: user.id }
            });

            if (!stakeholder) {
              stakeholder = await tx.stakeholder.create({
                data: {
                  userId: user.id,
                  stakeholderType: 'VENDOR',
                  kycStatus: 'UNDER_REVIEW',
                }
              });
            } else {
              // Update status if it exists
              stakeholder = await tx.stakeholder.update({
                where: { id: stakeholder.id },
                data: { kycStatus: 'UNDER_REVIEW' }
              });
            }

            // Check for existing vendor record
            const existingVendor = await tx.vendor.findUnique({
              where: { stakeholderId: stakeholder.id }
            });

            if (!existingVendor) {
              const uniqueSuffix = crypto.randomBytes(4).toString('hex').toUpperCase();
              await tx.vendor.create({
                data: {
                  stakeholderId: stakeholder.id,
                  vendorCode: `VND-${uniqueSuffix}`,
                  businessName: targetBusinessName,
                  vatRegistered: false,
                  primaryMarketId: marketId
                }
              });
            }
          } else if (targetRoleName === 'Supplier') {
            // Check for existing stakeholder
            let stakeholder = await tx.stakeholder.findUnique({
              where: { userId: user.id }
            });

            if (!stakeholder) {
              stakeholder = await tx.stakeholder.create({
                data: {
                  userId: user.id,
                  stakeholderType: 'SUPPLIER',
                  kycStatus: 'UNDER_REVIEW',
                }
              });
            } else {
              // Update status
              stakeholder = await tx.stakeholder.update({
                where: { id: stakeholder.id },
                data: {
                  kycStatus: 'UNDER_REVIEW'
                }
              });
            }

            // Check for existing supplier record
            const existingSupplier = await tx.supplier.findUnique({
              where: { stakeholderId: stakeholder.id }
            });

            if (!existingSupplier) {
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

          // SEND NOTIFICATION TO MARKET ADMIN
          if (marketId && ['Vendor', 'Supplier'].includes(targetRoleName)) {
            const marketMasters = await tx.marketMaster.findMany({
              where: { marketId: marketId },
              include: { admin: true }
            });

            for (const mm of marketMasters) {
              if (mm.admin) {
                await tx.notification.create({
                  data: {
                    userId: mm.admin.userId,
                    type: 'REGISTRATION_APPROVAL',
                    title: `Approval Needed: New ${targetRoleName}`,
                    message: `${invitation.metadata?.name || user.email} has registered for your market and is awaiting your approval.`,
                    priority: 'HIGH',
                    data: {
                      registrantId: user.id,
                      registrantRole: targetRoleName,
                      marketId: marketId,
                      action: 'REVIEW_REGISTRATION'
                    }
                  }
                });
              }
            }
          }
        }
      },
      {
        timeout: 20000,
      }
    );

    // Fetch updated user with new roles and stakeholder info
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        userRoles: { include: { role: true } },
        stakeholder: {
          include: {
            vendor: { include: { stalls: true } },
            supplier: true
          }
        },
        admin: {
          include: {
            marketMaster: true,
            pseudoMarketAdmin: true
          }
        }
      }
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
        marketId: roleName === 'MarketMaster'
          ? updatedUser.admin?.marketMaster?.marketId
          : (roleName === 'GateCounter'
            ? updatedUser.admin?.pseudoMarketAdmin?.marketId
            : (updatedUser.stakeholder?.vendor?.primaryMarketId || null)),
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
          kycStatus: updatedUser.stakeholder?.kycStatus || 'NOT_SUBMITTED',
          vendorId: updatedUser.stakeholder?.vendor?.id || null,
          stalls: updatedUser.stakeholder?.vendor?.stalls || []
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
    const { email, phone, password } = req.body;

    // Validate required fields
    if ((!email && !phone) || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email/Phone and password are required',
      });
    }

    let user = null;
    let identifier = null;

    if (email) {
      if (!validateEmail(email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format',
        });
      }
      identifier = normalizeEmail(email);
      user = await prisma.user.findUnique({
        where: { email: identifier },
        include: {
          userRoles: { include: { role: true } },
          stakeholder: { include: { vendor: { include: { stalls: true } }, supplier: true } },
          admin: { include: { marketMaster: true, pseudoMarketAdmin: true } }
        },
      });
    } else if (phone) {
      if (!validatePhone(phone)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid phone format (+256...)',
        });
      }
      identifier = normalizePhone(phone);
      user = await prisma.user.findUnique({
        where: { phone: identifier },
        include: {
          userRoles: { include: { role: true } },
          stakeholder: { include: { vendor: { include: { stalls: true } }, supplier: true } },
          admin: { include: { marketMaster: true, pseudoMarketAdmin: true } }
        },
      });
    }

    // Generic message
    if (!user || !user.passwordHash) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check verification
    if (email && !user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in',
      });
    }

    if (phone && !user.phoneVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your phone via OTP before logging in',
      });
    }

    // Check account status
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
        message: 'Invalid credentials',
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
        marketId: roleName === 'MarketMaster'
          ? user.admin?.marketMaster?.marketId
          : (roleName === 'GateCounter'
            ? user.admin?.pseudoMarketAdmin?.marketId
            : (user.stakeholder?.vendor?.primaryMarketId || null)),
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
          emailVerified: user.emailVerified,
          kycStatus: user.stakeholder?.kycStatus || 'NOT_SUBMITTED',
          vendorId: user.stakeholder?.vendor?.id || null,
          stalls: user.stakeholder?.vendor?.stalls || []
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
/**
 * GET /api/auth/markets
 * Fetch list of active markets
 */
exports.getMarkets = async (req, res) => {
  try {
    const markets = await prisma.market.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        uniqueCode: true,
      }
    });
    return res.status(200).json({
      success: true,
      data: markets
    });
  } catch (err) {
    console.error('getMarkets error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * POST /api/auth/forgot-password
 * Request a password reset link
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'A valid email is required',
      });
    }

    const normalizedEmail = normalizeEmail(email);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Security: Always return success even if user not found to prevent enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a reset link has been sent.',
      });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save token in transaction: Invalidate old ones and create new one
    await prisma.$transaction([
      prisma.verificationToken.updateMany({
        where: {
          userId: user.id,
          tokenType: 'PASSWORD_RESET',
          isUsed: false,
        },
        data: { isUsed: true },
      }),
      prisma.verificationToken.create({
        data: {
          token,
          tokenType: 'PASSWORD_RESET',
          userId: user.id,
          email: normalizedEmail,
          expiresAt,
        },
      }),
    ]);

    // Send email
    const frontendBase = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendBase}/reset-password?token=${encodeURIComponent(token)}`;

    try {
      await sendPasswordResetEmail(normalizedEmail, resetUrl);
    } catch (mailErr) {
      console.error('Password reset email failed:', mailErr);
      // We still return success to the user
    }

    return res.status(200).json({
      success: true,
      message: 'If an account exists with this email, a reset link has been sent.',
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.',
    });
  }
};

/**
 * POST /api/auth/reset-password
 * Reset password using token
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required',
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be between 8 and 64 characters',
      });
    }

    // Verify token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (
      !verificationToken ||
      verificationToken.tokenType !== 'PASSWORD_RESET' ||
      verificationToken.isUsed ||
      verificationToken.expiresAt < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset link',
      });
    }

    const userId = verificationToken.userId;

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update in transaction: Set password, mark token used, revoke sessions
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          passwordHash,
          lastPasswordChange: new Date(),
        },
      }),
      prisma.verificationToken.update({
        where: { id: verificationToken.id },
        data: {
          isUsed: true,
          usedAt: new Date(),
        },
      }),
      // Session Revocation: Kick out from all devices
      prisma.userSession.updateMany({
        where: { userId, isActive: true },
        data: {
          isActive: false,
          logoutReason: 'PASSWORD_RESET',
          loggedOutAt: new Date(),
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. Please log in with your new password.',
    });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.',
    });
  }
};

/**
 * GET /api/auth/me
 * Get current user profile details
 */
exports.getMe = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        stakeholder: {
          include: {
            vendor: { include: { primaryMarket: true, stalls: true } },
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

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Determine name
    const profile = user.profile;
    const fullName = profile
      ? `${profile.firstName} ${profile.lastName}`.trim()
      : user.email.split('@')[0];

    // Get primary market name
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

    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        phone: user.phone || profile?.primaryPhone || 'No phone set',
        name: fullName,
        role: user.userRoles[0]?.role?.name || 'Guest',
        kycStatus: user.stakeholder?.kycStatus || 'NOT_SUBMITTED',
        businessId,
        vendorId: user.stakeholder?.vendor?.id || null, // Actual UUID
        marketId: user.admin?.marketMaster?.marketId || user.stakeholder?.vendor?.primaryMarketId || null,
        marketName,
        secondaryLabel,
        shopNumber: user.stakeholder?.vendor?.stalls?.[0]?.stallNumber || null,
        stalls: user.stakeholder?.vendor?.stalls || []
      }
    });
  } catch (err) {
    console.error('getMe error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * POST /api/auth/update-profile
 * Update user's name
 */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { name } = req.body;

    if (!name || name.trim().split(' ').length < 1) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid name'
      });
    }

    const parts = name.trim().split(' ');
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ') || ' ';

    await prisma.userProfile.upsert({
      where: { userId },
      update: { firstName, lastName },
      create: {
        userId,
        firstName,
        lastName,
        primaryPhone: '',
        primaryEmail: req.user.email
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (err) {
    console.error('updateProfile error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * POST /api/auth/change-password
 * Change password for logged in user
 */
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current and new passwords are required'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect current password'
      });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'New password does not meet requirements (8-64 characters)'
      });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        lastPasswordChange: new Date()
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (err) {
    console.error('changePassword error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
/**
 * GET /api/auth/verify-vendor-email
 * Verify if the token is valid for vendor email verification and password setup
 * Returns vendor info if token is valid
 */
exports.verifyVendorEmail = async (req, res) => {
  try {
    const token = req.query.token || req.body.token;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required',
      });
    }

    // Find invitation by token
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        vendor: true
      }
    });

    if (!invitation) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification link',
      });
    }

    // Check if it's a vendor password setup invitation
    if (invitation.metadata?.purpose !== 'VENDOR_EMAIL_VERIFY_AND_SET_PASSWORD') {
      return res.status(400).json({
        success: false,
        message: 'This link is not valid for vendor password setup',
      });
    }

    // Check status is PENDING
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
        message: 'This verification link has expired. Please request a new one.',
        code: 'TOKEN_EXPIRED',
      });
    }

    // Return vendor info for the setup form
    return res.status(200).json({
      success: true,
      data: {
        email: invitation.email,
        firstName: invitation.metadata?.firstName || '',
        lastName: invitation.metadata?.lastName || '',
        businessName: invitation.metadata?.businessName || '',
        token: token
      }
    });
  } catch (err) {
    console.error('verifyVendorEmail error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * POST /api/auth/set-vendor-password
 * Set password for vendor and activate their account
 * 
 * Request body:
 * - token: Verification token (required)
 * - password: New password (required)
 */
exports.setVendorPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and password are required',
      });
    }

    // Password validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long',
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

    // Check if it's a vendor password setup invitation
    if (invitation.metadata?.purpose !== 'VENDOR_EMAIL_VERIFY_AND_SET_PASSWORD') {
      return res.status(400).json({
        success: false,
        message: 'This link is not valid for vendor password setup',
      });
    }

    // Check status is PENDING
    if (invitation.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'This verification link is no longer valid',
      });
    }

    // Check expiration
    if (invitation.expiresAt <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'This verification link has expired',
        code: 'TOKEN_EXPIRED',
      });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: invitation.email },
      include: {
        userRoles: { include: { role: true } },
        stakeholder: { include: { vendor: true } }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found',
      });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update user and invitation in transaction
    await prisma.$transaction(async (tx) => {
      // Update user: set new password, activate email verification and status
      await tx.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          emailVerified: true,
          status: 'ACTIVE'
        }
      });

      // Update invitation: mark as accepted
      await tx.invitation.update({
        where: { id: invitation.id },
        data: {
          status: 'ACCEPTED',
          acceptedAt: new Date(),
          acceptedByUserId: user.id
        }
      });
    });

    // Generate JWT token for auto-login
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.userRoles[0]?.role.name || 'Vendor'
    };

    // Note: You'll need to import jwt library at the top of this file
    // const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    return res.status(200).json({
      success: true,
      message: 'Password set successfully. Your account is now active.',
      data: {
        email: user.email,
        userId: user.id,
        message: 'You can now log in with your email and password'
      }
    });
  } catch (err) {
    console.error('setVendorPassword error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * POST /api/auth/send-otp
 * Send a 6-digit OTP to a user's phone
 */
exports.sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
      });
    }

    if (!validatePhone(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Ugandan phone format (+256...)',
      });
    }

    const normalizedPhone = normalizePhone(phone);

    // Check if user exists with this phone
    const user = await prisma.user.findUnique({
      where: { phone: normalizedPhone },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this phone number',
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store in VerificationToken
    await prisma.verificationToken.upsert({
      where: { token: otp }, // This might collide, but unlikely for 6 digits in 10 mins. Better use phone as unique key if schema allowed.
      // Since 'token' is @unique in schema, we'll just create a new one every time and delete old ones if needed.
      // But upsert requires a unique field.
      update: {
        token: otp,
        expiresAt,
        isUsed: false,
        attempts: 0,
      },
      create: {
        token: otp,
        tokenType: 'PHONE_VERIFICATION',
        phone: normalizedPhone,
        userId: user.id,
        expiresAt,
      },
    });

    // SIMULATED SMS SENDING
    console.log(`[SMS SIMULATION] OTP for ${normalizedPhone}: ${otp}`);

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully. Please check your phone.',
      data: {
        phone: normalizedPhone,
        expiresIn: '10 minutes',
      },
    });
  } catch (err) {
    console.error('sendOtp error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to send OTP',
    });
  }
};

/**
 * POST /api/auth/verify-otp
 * Verify the 6-digit OTP
 */
exports.verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone and OTP are required',
      });
    }

    const normalizedPhone = normalizePhone(phone);

    // Find the latest unused OTP for this phone
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        phone: normalizedPhone,
        token: otp,
        tokenType: 'PHONE_VERIFICATION',
        isUsed: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!verificationToken) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

    if (verificationToken.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired',
      });
    }

    // Mark as used and verify user
    await prisma.$transaction([
      prisma.verificationToken.update({
        where: { id: verificationToken.id },
        data: { isUsed: true, usedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: verificationToken.userId },
        data: { phoneVerified: true, status: 'ACTIVE' },
      }),
    ]);

    // Get updated user with roles
    const user = await prisma.user.findUnique({
      where: { id: verificationToken.userId },
      include: { userRoles: { include: { role: true } } },
    });

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        phone: user.phone,
        role: user.userRoles[0]?.role?.name || 'Guest',
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Phone verified successfully',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          role: user.userRoles[0]?.role?.name || 'Guest',
        },
      },
    });
  } catch (err) {
    console.error('verifyOtp error:', err);
    return res.status(500).json({
      success: false,
      message: 'Verification failed',
    });
  }
};
