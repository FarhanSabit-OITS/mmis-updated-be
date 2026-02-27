const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/register', authController.register);
router.get('/verify-email', authController.verifyEmail);
router.post('/verify-email', authController.verifyEmail);
router.get('/verify-vendor-email', authController.verifyVendorEmail);
router.post('/set-vendor-password', authController.setVendorPassword);
router.post('/login', authController.login);
router.get('/markets', authController.getMarkets);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post('/resend-verification', authController.resendVerification);
router.post('/gate-token/:supplierId', authMiddleware, authController.generateGateToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Profile & Settings
router.get('/me', authMiddleware, authController.getMe);
router.post('/update-profile', authMiddleware, authController.updateProfile);
router.post('/change-password', authMiddleware, authController.changePassword);

module.exports = router;
