const rateLimit = require('express-rate-limit');

/**
 * Global API rate limiter
 * Limits general API usage to prevent DDoS and resource exhaustion
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

/**
 * Strict rate limiter for Authentication
 * Specifically targets brute-force attempts on login/register
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 attempts per `window`
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.'
  },
  // In a real production environment with proxy, you'd use:
  // keyGenerator: (req) => req.headers['x-forwarded-for'] || req.ip
});

module.exports = {
  apiLimiter,
  authLimiter
};
