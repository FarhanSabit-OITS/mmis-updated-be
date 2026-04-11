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

module.exports = function authMiddleware(req, res, next) {
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request
    req.user = {
      id: decoded.userId,
      userId: decoded.userId, // For compatibility with some controllers
      email: decoded.email,
      roleName: decoded.roleName || null,
      roleLevel: decoded.roleLevel || null,
      marketId: decoded.marketId || null,
    };

    return next();
  } catch (err) {
    // Log error for debugging (but don't expose details to client)
    console.error('JWT verification error:', err.message);

    // Different error messages for different scenarios
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Token has expired',
      });
    }

    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid token',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or expired token',
    });
  }
};
