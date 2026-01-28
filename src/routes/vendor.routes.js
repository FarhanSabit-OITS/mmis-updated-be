/**
 * Vendor Routes
 * 
 * Defines all vendor-related API endpoints for SuperAdmin
 * All routes require authentication and SuperAdmin role
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const superAdminMiddleware = require('../middleware/superadmin.middleware');
const vendorController = require('../controllers/vendor.controller');

// Middleware: All vendor routes require authentication and SuperAdmin role
router.use(authMiddleware);
router.use(superAdminMiddleware);

// =====================
// Vendor Management
// =====================

/**
 * Get all vendors with comprehensive data
 * GET /api/superadmin/vendors
 * Query params: page, limit, search, kycStatus, marketId, vatRegistered, sortBy, order
 */
router.get('/', vendorController.getAllVendors);

module.exports = router;
