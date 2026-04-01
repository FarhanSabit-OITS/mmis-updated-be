const express = require('express');
const router = express.Router();
const tokenController = require('../controllers/token.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// Token Operations (Aligned with token.service)
router.get('/', authMiddleware, async (req, res) => {
    // Stub for getAll tokens
    return res.status(200).json({ success: true, data: [] });
});

router.post('/generate', authMiddleware, tokenController.generateEntryToken);
router.post('/validate', authMiddleware, async (req, res) => {
    // Stub for validation
    return res.status(200).json({ success: true, message: 'Token is valid' });
});

router.post('/:id/revoke', authMiddleware, async (req, res) => {
    // Stub for revoke
    return res.status(200).json({ success: true, message: 'Token revoked' });
});

router.get('/:code', authMiddleware, tokenController.getTokenDetails);
router.post('/dispatch', authMiddleware, tokenController.recordStockDispatch);
router.post('/exit', authMiddleware, tokenController.recordExit);

// Legacy/Market specific paths
router.post('/entry', authMiddleware, tokenController.generateEntryToken);

module.exports = router;
