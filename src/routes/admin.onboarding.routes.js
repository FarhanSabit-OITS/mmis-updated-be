const express = require('express');
const router = express.Router();
const adminOnboardingController = require('../controllers/admin.onboarding.controller');
const authMiddleware = require('../middleware/auth.middleware');
const isSuperAdmin = require('../middleware/superadmin.middleware');
const isMarketAuthority = require('../middleware/marketAuthority.middleware');

// Super Admin Endpoints
router.post('/invite', authMiddleware, isSuperAdmin, adminOnboardingController.generateInvitation);

// Market Authority Endpoints
router.post('/ma/generate-code', authMiddleware, isMarketAuthority, adminOnboardingController.generateHandshakeCode);
router.post('/ma/emergency-lock', authMiddleware, isMarketAuthority, adminOnboardingController.emergencyLock);

// Public/Provisional Endpoints
router.post('/verify-handshake', adminOnboardingController.verifyHandshake);

module.exports = router;
