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

const adminMiddleware = require('../middleware/admin.middleware');

router.use(authMiddleware);

// =====================
// Vendor Management
// =====================

/**
 * Get all vendors with comprehensive data
 */
router.get('/', adminMiddleware, vendorController.getAllVendors);

/**
 * Approve a pending vendor/supplier registration
 * POST /api/superadmin/vendors/:id/approve
 */
router.post('/:id/approve', adminMiddleware, vendorController.approveVendor);

/**
 * Create a new vendor
 */
router.post('/', superAdminMiddleware, vendorController.createVendor);

/**
 * Delete (deactivate) a vendor
 */
router.delete('/:id', superAdminMiddleware, vendorController.deleteVendor);

module.exports = router;
