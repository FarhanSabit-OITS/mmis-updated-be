const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/application.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// All application routes require authentication
router.get('/', authMiddleware, applicationController.getAll);
router.post('/', authMiddleware, applicationController.submit);
router.post('/:id/approve', authMiddleware, applicationController.approve);
router.post('/:id/reject', authMiddleware, applicationController.reject);

module.exports = router;
