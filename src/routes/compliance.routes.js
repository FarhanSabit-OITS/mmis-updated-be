const express = require('express');
const router = express.Router();
const complianceController = require('../controllers/compliance.controller');
// Assuming authMiddleware is available to verify Market Master role
// const { protect, authorize } = require('../middleware/auth');

router.post('/audit', complianceController.triggerAudit);
router.get('/dashboard', complianceController.getComplianceDashboard);

module.exports = router;
