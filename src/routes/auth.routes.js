const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/register', authController.register);
router.get('/verify-email', authController.verifyEmail);
router.post('/verify-email', authController.verifyEmail);
router.post('/login', authController.login);
router.get('/markets', authController.getMarkets);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post('/resend-verification', authController.resendVerification);
router.post('/gate-token/:supplierId', authMiddleware, authController.generateGateToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
