// src/middleware/scope.middleware.js
/**
 * Jurisdictional Scoping Middleware
 * 
 * Enforces ABAC boundaries by ensuring users only access 
 * data within their assigned jurisdiction (Market, City, or District).
 * 
 * It adds a `req.jurisdiction` filter object that can be spread into Prisma queries.
 */

const AppError = require('../errors/AppError');

const scopeMiddleware = (req, res, next) => {
  const user = req.user;

  if (!user) {
    return next(new AppError('Authentication required', 401));
  }

  // National/Super Admin Level: No Scoping
  if (user.roleLevel === 'SUPER_ADMIN' || user.roleLevel === 'NATIONAL_ADMIN') {
    req.jurisdiction = {};
    return next();
  }

  // Market Level Scoping
  if (user.roleLevel === 'MARKET_MASTER' || user.roleLevel === 'PSEUDO_MARKET_ADMIN') {
    if (!user.marketId) {
      return next(new AppError('Access Denied: Market jurisdiction not established.', 403));
    }
    req.jurisdiction = { marketId: user.marketId };
    return next();
  }

  // City Level Scoping
  if (user.roleLevel === 'CITY_ADMIN') {
    if (!user.cityId) {
      return next(new AppError('Access Denied: City jurisdiction not established.', 403));
    }
    req.jurisdiction = { market: { cityId: user.cityId } };
    return next();
  }

  // District Level Scoping
  if (user.roleLevel === 'DISTRICT_ADMIN') {
    if (!user.districtId) {
      return next(new AppError('Access Denied: District jurisdiction not established.', 403));
    }
    req.jurisdiction = { market: { city: { districtId: user.districtId } } };
    return next();
  }

  // Default User/Vendor/Supplier: Scope by their linked market
  if (user.marketId) {
    req.jurisdiction = { marketId: user.marketId };
    return next();
  }

  // Fallback: Deny access if no scope can be established for a scoped route
  return next(new AppError('Access Denied: No jurisdictional scope found for your account.', 403));
};

module.exports = scopeMiddleware;
