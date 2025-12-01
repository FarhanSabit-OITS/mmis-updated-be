// src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');

module.exports = function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];

  if (!authHeader) {
    return res.status(401).json({ message: 'Unauthorized: Missing Authorization header' });
  }

  // Expect header like: "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Unauthorized: Invalid Authorization header format' });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);


    req.user = {
        id: decoded.userId,
        roleName: decoded.roleName || null,
        roleLevel: decoded.roleLevel || null,
 };
    return next();
  } catch (err) {
    console.error('JWT verification error:', err);
    return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
  }
};
