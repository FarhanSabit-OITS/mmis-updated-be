const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff.controller');
const { authMiddleware, roleMiddleware } = require('../middleware/auth.middleware');

// Root path /api/market/staff
router.get('/gate-counters', authMiddleware, staffController.getGateCounters);
router.post('/gate-counters', authMiddleware, staffController.createGateCounter);
router.delete('/gate-counters/:id', authMiddleware, staffController.deleteGateCounter);

module.exports = router;
