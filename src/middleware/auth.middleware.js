// src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');

/**
 * JWT Authentication Middleware
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Missing Authorization header',
    });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid format. Use: Authorization: Bearer <token>',
    });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    req.user = {
      id: decoded.userId,
      userId: decoded.userId,
      email: decoded.email,
      roleName: decoded.roleName || null,
      roleLevel: decoded.roleLevel || null,
      marketId: decoded.marketId || null,
    };

    return next();
  } catch (err) {
    console.error('JWT verification error:', err.message);

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Token has expired. Please log in again.',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or expired token',
    });
  }
};

/**
 * Role-Based Access Control Middleware
 */
const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roleName) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User role not found',
      });
    }

    const hasRole = allowedRoles.includes(req.user.roleName);
    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: This action requires one of the following roles: ${allowedRoles.join(', ')}`,
      });
    }

    return next();
  };
};

module.exports = {
  authMiddleware,
  roleMiddleware
};
