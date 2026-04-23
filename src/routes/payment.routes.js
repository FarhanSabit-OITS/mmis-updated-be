const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const billingController = require('../controllers/billing.controller');
const paymentAttemptController = require('../controllers/payment-attempt.controller');
const paymentOpsController = require('../controllers/payment-ops.controller');
const refundController = require('../controllers/refund.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Provider webhook route must remain outside bearer-auth middleware
router.post('/payments/flutterwave/webhook', paymentOpsController.receiveFlutterwaveWebhook);

// All payment routes require authentication
router.use(authMiddleware);

// Vendor payment routes
router.get('/vendors/:vendorId/payments/summary', paymentController.getVendorPaymentSummary);
router.get('/vendors/:vendorId/payments/rent', paymentController.getVendorRentPayments);
router.get('/vendors/:vendorId/payments/tax', paymentController.getVendorTaxPayments);
router.get('/vendors/:vendorId/payments/history', paymentController.getVendorPaymentHistory);
router.post('/vendors/:vendorId/payments/attempts', paymentAttemptController.createVendorAttempt);
router.get('/vendors/:vendorId/payments/attempts', paymentAttemptController.listVendorAttempts);
router.get('/vendors/:vendorId/payments/attempts/:attemptId', paymentAttemptController.getVendorAttemptDetail);
router.get('/vendors/:vendorId/payments/attempts/:attemptId/status', paymentAttemptController.getVendorAttemptStatus);
router.get('/vendors/:vendorId/payments/receipts/:paymentId/pdf', paymentAttemptController.downloadVendorReceiptPdf);

// Payment processing routes
router.post('/payments/evidence', paymentController.uploadPaymentEvidence);
router.post('/payments/rent/record', paymentController.recordRentPayment);

// Admin payment routes
router.get('/admin/payments/collections', paymentController.getAdminPaymentCollections);
router.get('/admin/payments/outstanding', paymentController.getOutstandingPayments);
router.get('/admin/payments/vendors', paymentController.getScopedVendorsWithPayments);
router.post('/admin/payments/send-reminder', paymentController.sendPaymentReminder);
router.get('/admin/payments/online', paymentOpsController.listAdminOnlinePayments);
router.get('/admin/payments/online/:attemptId', paymentOpsController.getAdminOnlinePaymentDetail);
router.post('/admin/payments/online/:attemptId/reverify', paymentOpsController.reverifyAttempt);
router.get('/admin/payments/webhooks', paymentOpsController.listWebhookEvents);
router.post('/admin/payments/webhooks/:eventId/reprocess', paymentOpsController.reprocessWebhookEvent);
router.get('/admin/refunds', refundController.listRefunds);
router.post('/admin/refunds', refundController.createRefundRecord);
router.post('/admin/refunds/:refundId/status', refundController.updateRefundStatus);

// Invoice generation and billing routes
router.post('/admin/invoices/generation-runs', billingController.createGenerationRun);
router.get('/admin/invoices/generation-runs', billingController.listGenerationRuns);
router.get('/admin/invoices/generation-runs/:id', billingController.getGenerationRun);
router.get('/admin/invoices', billingController.listAdminInvoices);
router.get('/admin/invoices/:invoiceId', billingController.getAdminInvoiceDetail);
router.get('/admin/invoices/:invoiceId/pdf', billingController.downloadAdminInvoicePdf);
router.get('/admin/payment-claims', billingController.listAdminPaymentClaims);
router.get('/admin/payment-claims/:id', billingController.getAdminPaymentClaim);
router.post('/admin/payment-claims/:id/approve', billingController.approvePaymentClaim);
router.post('/admin/payment-claims/:id/reject', billingController.rejectPaymentClaim);

router.get('/vendors/:vendorId/invoices', billingController.listVendorInvoices);
router.get('/vendors/:vendorId/invoices/:invoiceId', billingController.getVendorInvoiceDetail);
router.get('/vendors/:vendorId/invoices/:invoiceId/pdf', billingController.downloadVendorInvoicePdf);
router.post('/vendors/:vendorId/payment-claims', billingController.submitVendorPaymentClaim);
router.get('/vendors/:vendorId/payment-claims', billingController.listVendorPaymentClaims);

module.exports = router;
