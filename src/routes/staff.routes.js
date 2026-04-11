const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff.controller');
const authMiddleware = require('../middleware/auth.middleware');
const scopeMiddleware = require('../middleware/scope.middleware');

router.use(authMiddleware);
router.use(scopeMiddleware);

const validate = require('../middleware/validate.middleware').validate;
const { createStaffSchema, updateStaffSchema } = require('../validations/staff.validation');

// Generic Staff Endpoints (Includes Security, Health, etc. via query filters)
router.get('/', authMiddleware, staffController.getAllStaff);
router.post('/', authMiddleware, validate(createStaffSchema), staffController.createStaff);
router.patch('/:id', authMiddleware, validate(updateStaffSchema), staffController.updateStaff);
router.delete('/:id', authMiddleware, staffController.deleteStaff);

// Legacy/Specialized Aliases
router.get('/gate-counters', authMiddleware, staffController.getGateCounters);
router.post('/gate-counters', authMiddleware, staffController.createGateCounter);
router.delete('/gate-counters/:id', authMiddleware, staffController.deleteGateCounter);

module.exports = router;
