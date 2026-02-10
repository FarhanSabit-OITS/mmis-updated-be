// src/middleware/admin.middleware.js
/**
 * Admin Authorization Middleware
 * Allows SuperAdmin and MarketMaster roles
 */

module.exports = function adminMiddleware(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized: Authentication required',
        });
    }

    const { roleName } = req.user;

    if (roleName !== 'SuperAdmin' && roleName !== 'MarketMaster') {
        return res.status(403).json({
            success: false,
            message: 'Forbidden: Admin privileges required',
        });
    }

    return next();
};
