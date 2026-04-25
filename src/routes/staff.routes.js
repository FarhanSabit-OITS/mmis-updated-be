const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Root path /api/market/staff
router.get('/gate-counters', authMiddleware, staffController.getGateCounters);
router.post('/gate-counters', authMiddleware, staffController.createGateCounter);
router.delete('/gate-counters/:id', authMiddleware, staffController.deleteGateCounter);

router.get('/stock-counters', authMiddleware, staffController.getStockCounters);
router.post('/stock-counters', authMiddleware, staffController.createStockCounter);
router.delete('/stock-counters/:id', authMiddleware, staffController.deleteStockCounter);

module.exports = router;
