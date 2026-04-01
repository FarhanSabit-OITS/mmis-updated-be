const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// All AI routes require authentication
router.post('/chat', authMiddleware, aiController.chat);
router.post('/analyze', authMiddleware, aiController.analyze);
router.post('/help', authMiddleware, aiController.getHelp);

module.exports = router;
