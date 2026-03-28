const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const authMiddleware = require('../middleware/auth.middleware');

// All payment routes require authentication
router.use(authMiddleware);

// Vendor payment routes
router.get('/vendors/:vendorId/payments/summary', paymentController.getVendorPaymentSummary);
router.get('/vendors/:vendorId/payments/rent', paymentController.getVendorRentPayments);
router.get('/vendors/:vendorId/payments/tax', paymentController.getVendorTaxPayments);
router.get('/vendors/:vendorId/payments/history', paymentController.getVendorPaymentHistory);

// Payment processing routes
router.post('/payments/evidence', paymentController.uploadPaymentEvidence);
router.post('/payments/rent/record', paymentController.recordRentPayment);

// Admin payment routes
router.get('/admin/payments/collections', paymentController.getAdminPaymentCollections);
router.get('/admin/payments/outstanding', paymentController.getOutstandingPayments);
router.get('/admin/payments/vendors', paymentController.getScopedVendorsWithPayments);
router.post('/admin/payments/send-reminder', paymentController.sendPaymentReminder);

module.exports = router;
