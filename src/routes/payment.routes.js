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
router.post('/payments/rent/pay', paymentController.processRentPayment);
router.post('/payments/tax/pay', paymentController.processTaxPayment);
router.post('/payments/generate-invoice', paymentController.generateInvoice);

// Admin payment routes
router.get('/admin/payments/collections', paymentController.getAdminPaymentCollections);
router.get('/admin/payments/outstanding', paymentController.getOutstandingPayments);
router.post('/admin/payments/send-reminder', paymentController.sendPaymentReminder);

// Webhook routes (may not need authentication for external services)
router.post('/webhooks/payment-confirmation', paymentController.handlePaymentWebhook);
router.post('/webhooks/ura-callback', paymentController.handleURACallback);

module.exports = router;