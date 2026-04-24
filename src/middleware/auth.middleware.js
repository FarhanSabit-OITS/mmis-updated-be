// src/middleware/auth.middleware.js
/**
 * JWT Authentication Middleware
 * 
 * Validates JWT token from Authorization header
 * Sets req.user with decoded token data
 * 
 * Usage:
 * app.get('/api/protected', authMiddleware, controller.action);
 * 
 * Expected header: Authorization: Bearer <token>
 */

const jwt = require('jsonwebtoken');
const prisma = require('../prisma');

const BILLING_ONLY_ALLOWED_PATTERNS = [
  /^\/api\/auth\/me(?:\/|$)/,
  /^\/api\/notifications(?:\/|$)/,
  /^\/api\/vendors\/[^/]+\/invoices(?:\/|$)/,
  /^\/api\/vendors\/[^/]+\/payment-claims(?:\/|$)/,
  /^\/api\/vendors\/[^/]+\/payments(?:\/|$)/,
  /^\/api\/payments(?:\/|$)/,
];

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Missing Authorization header',
    });
  }

  // Expect header format: "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid Authorization header format. Use: Authorization: Bearer <token>',
    });
  }

  const token = parts[1];

  try {
    // Verify and decode JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Attach user info to request
    req.user = {
      id: decoded.userId,
      userId: decoded.userId, // For compatibility with some controllers
      email: decoded.email,
      roleName: decoded.roleName || null,
      roleLevel: decoded.roleLevel || null,
      marketId: decoded.marketId || null,
    };

    if (decoded.roleName === 'Vendor') {
      prisma.vendor.findFirst({
        where: { stakeholder: { userId: decoded.userId } },
        include: { billingStatus: true },
      }).then((vendor) => {
        if (vendor?.billingStatus?.billingAccessState === 'BILLING_ONLY_RESTRICTED') {
          const requestPath = req.originalUrl || req.url || '';
          const allowed = BILLING_ONLY_ALLOWED_PATTERNS.some((pattern) => pattern.test(requestPath));
          if (!allowed) {
            return res.status(403).json({
              success: false,
              message: 'Access restricted to billing and payment pages until rent arrears are resolved.',
              data: {
                billingAccessState: vendor.billingStatus.billingAccessState,
                contactAdminEmail: vendor.billingStatus.contactAdminEmail,
                contactAdminPhone: vendor.billingStatus.contactAdminPhone,
              },
            });
          }
        }
        return next();
      }).catch((lookupError) => {
        console.error('Vendor billing restriction lookup error:', lookupError.message);
        return next();
      });
      return;
    }

    return next();
  } catch (err) {
    // Log error for debugging (but don't expose details to client)
    console.error('JWT verification error:', err.message);

    // Different error messages for different scenarios
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Token has expired. Please log in again.',
      });
    }

    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid token.',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or expired token',
    });
  }
}

function requireRole(allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        if (!allowedRoles.includes(req.user.roleName)) {
            return res.status(403).json({ success: false, message: `Forbidden: Requires one of [${allowedRoles.join(", ")}] roles` });
        }
        next();
    };
}

module.exports = authMiddleware;
module.exports.verifyToken = authMiddleware;
module.exports.requireRole = requireRole;
