const express = require('express');
const router = express.Router();
const complianceController = require('../controllers/compliance.controller');
const authMiddleware = require('../middleware/auth.middleware');
const superAdminMiddleware = require('../middleware/superadmin.middleware');

// All compliance routes require authentication
router.use(authMiddleware);

// Trigger a full compliance audit — SuperAdmin only
router.post('/audit', superAdminMiddleware, complianceController.triggerAudit);

// Dashboard accessible to all authenticated admins (MarketMaster + SuperAdmin)
router.get('/dashboard', complianceController.getComplianceDashboard);

// Identity Analytics
router.get('/identity/stats', complianceController.getIdentityStats);
router.get('/identity/anomalies', complianceController.getIdentityAnomalies);

// Audit log query — SuperAdmin only
router.get('/audit-logs', superAdminMiddleware, complianceController.getAuditLogs);

// NIN Verification
router.post('/verify-nin', complianceController.verifyNin);

module.exports = router;
