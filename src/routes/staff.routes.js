const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff.controller');
const { authMiddleware, roleMiddleware } = require('../middleware/auth.middleware');

// Gate Counter Management (Aligned with staff.service)
router.get('/counters', authMiddleware, staffController.getGateCounters);
router.post('/counters', authMiddleware, staffController.createGateCounter);
router.delete('/counters/:id', authMiddleware, staffController.deleteGateCounter);

// Legacy/Market specific paths
router.get('/gate-counters', authMiddleware, staffController.getGateCounters);
router.post('/gate-counters', authMiddleware, staffController.createGateCounter);
router.delete('/gate-counters/:id', authMiddleware, staffController.deleteGateCounter);

// Staff Assignment (Stubs or new logic)
router.post('/assign', authMiddleware, async (req, res) => {
    // Basic stub for staff assignment to gates/sections
    return res.status(200).json({ success: true, message: 'Staff assigned successfully' });
});
router.delete('/assign/:id', authMiddleware, async (req, res) => {
    return res.status(200).json({ success: true, message: 'Assignment removed' });
});
router.get('/', authMiddleware, staffController.getGateCounters); // Default to gate counters for now

module.exports = router;
