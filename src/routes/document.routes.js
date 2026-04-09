const express = require('express');
const router = express.Router();
const documentController = require('../controllers/document.controller');

// Global Document Discovery
router.get('/', documentController.getDocuments);

// Compliance Alerts
router.get('/alerts', documentController.getComplianceAlerts);

// Document Verification
router.patch('/:id/verify', documentController.verifyDocument);

module.exports = router;
