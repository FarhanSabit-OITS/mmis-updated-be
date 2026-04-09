/**
 * Market Authority Authorization Middleware
 * 
 * Verifies that the authenticated user has either 'MarketAuthority' role 
 * or is a 'SuperAdmin' (for override/emergency support).
 */
module.exports = function isMarketAuthority(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized: Authentication required',
        });
    }

    const { roleName } = req.user;

    // Check for MarketAuthority or SuperAdmin override
    const authorizedRoles = ['MarketAuthority', 'SuperAdmin'];
    
    if (!authorizedRoles.includes(roleName)) {
        return res.status(403).json({
            success: false,
            message: 'Forbidden: This action requires Market Authority clearance.',
        });
    }

    return next();
};
