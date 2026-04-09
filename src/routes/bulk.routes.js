const express = require('express');
const router = express.Router();
const bulkController = require('../controllers/bulk.controller');
// In a full implementation, we'd add auth middleware here (e.g., isAdmin)
// const { authenticate, isAdmin } = require('../middleware/auth.middleware');

router.post('/users', bulkController.bulkUploadUsers);
router.post('/vendors', bulkController.bulkUploadVendors);
router.post('/facilities', bulkController.bulkUploadFacilities);

module.exports = router;
