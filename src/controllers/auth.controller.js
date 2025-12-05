const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
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
 *   "firstName": "John",
 *   "lastName": "Doe",
 *   "email": "  john.doe@example.com  ",
 *   "password": "SecurePassword123"
 * }
 */
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Validate all fields are present
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: firstName, lastName, email, password',
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
    const normalizedFirstName = normalizeName(firstName);
    const normalizedLastName = normalizeName(lastName);

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

    // For now, log to console;TODO later integrate with nodemailer/SES
    console.log(`

EMAIL VERIFICATION (DEV MODE)                 
----------------------------
 To: ${normalizedEmail}
 Verification Link:
 ${verificationLink}

    `);

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
  }
};

/**
 * GET /api/auth/verify-email?token=...
 * Verify user email and activate account
 */
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

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
        message: 'This verification link has expired. Please register again to receive a new link.',
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

        // Update invitation: set status = ACCEPTED with timestamp and user reference
        await tx.invitation.update({
          where: { id: invitation.id },
          data: {
            status: 'ACCEPTED',
            acceptedAt: new Date(),
            acceptedByUserId: user.id,
          },
        });
      },
      {
        timeout: 10000,
      }
    );

    // Respond wsuccess
    return res.status(200).json({
      success: true,
      message: 'Email verified successfully. You can now log in.',
      data: {
        email: user.email,
        emailVerified: true,
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

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        roleName,
        roleLevel,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    //  Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLogin: new Date(),
      },
    });

    // Respond with token
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: roleName,
          status: user.status,
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
