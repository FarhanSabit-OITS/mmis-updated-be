const express = require('express');
const router = express.Router();
const tokenController = require('../controllers/token.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// All token routes require authentication
router.post('/entry', authMiddleware, tokenController.generateEntryToken);
router.get('/:code', authMiddleware, tokenController.getTokenDetails);
router.post('/dispatch', authMiddleware, tokenController.recordStockDispatch);
router.post('/exit', authMiddleware, tokenController.recordExit);

module.exports = router;
