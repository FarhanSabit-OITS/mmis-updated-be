/**
 * Vendor Routes
 * 
 * Defines all vendor-related API endpoints for SuperAdmin
 * All routes require authentication and SuperAdmin role
 */

const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const superAdminMiddleware = require('../middleware/superadmin.middleware');
const vendorController = require('../controllers/vendor.controller');
const vendorOnboardingController = require('../controllers/vendor.onboarding.controller');

const adminMiddleware = require('../middleware/admin.middleware');

router.use(authMiddleware);

// =====================
// Vendor Self-Onboarding
// =====================
/**
 * Setup Shop and Stall for new Vendor
 * POST /api/vendors/setup-shop
 */
router.post('/setup-shop', vendorOnboardingController.setupShop);

// router.use(adminMiddleware); // Removed to allow fallthrough for non-admin routes like products

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
 * Reject a pending vendor/supplier registration
 * POST /api/superadmin/vendors/:id/reject
 */
router.post('/:id/reject', adminMiddleware, vendorController.rejectVendor);

/**
 * Create a new vendor
 */
router.post('/', superAdminMiddleware, vendorController.createVendor);

/**
 * Bulk upload vendors from CSV
 * POST /api/vendors/bulk-upload
 */
router.post(
    '/bulk-upload',
    superAdminMiddleware,
    vendorController.uploadMiddleware,
    vendorController.bulkUploadVendors
);

/**
 * Delete (deactivate) a vendor
 */
router.delete('/:id', superAdminMiddleware, vendorController.deleteVendor);

module.exports = router;
