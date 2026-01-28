// src/middleware/superadmin.middleware.js
/**
 * SuperAdmin Authorization Middleware
 * 
 * Verifies that the authenticated user has SuperAdmin role
 * Must be used after authMiddleware
 * 
 * Usage:
 * app.get('/api/superadmin/resource', authMiddleware, superAdminMiddleware, controller.action);
 */

module.exports = function superAdminMiddleware(req, res, next) {
    // Check if user is authenticated (should be set by authMiddleware)
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized: Authentication required',
        });
    }

    const { roleName } = req.user;

    // Verify SuperAdmin role
    if (roleName !== 'SuperAdmin') {
        return res.status(403).json({
            success: false,
            message: 'Forbidden: This endpoint requires SuperAdmin privileges',
        });
    }

    return next();
};
