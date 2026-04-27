const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const billingController = require('../controllers/billing.controller');
const authMiddleware = require('../middleware/auth.middleware');
const fileUpload = require('express-fileupload');

const fileUploadMiddleware = fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 },
  useTempFiles: true,
  tempFileDir: '/tmp/'
});

// All payment routes require authentication
router.use(authMiddleware);

// Vendor payment routes
router.get('/vendors/:vendorId/payments/summary', paymentController.getVendorPaymentSummary);
router.get('/vendors/:vendorId/payments/rent', paymentController.getVendorRentPayments);
router.get('/vendors/:vendorId/payments/tax', paymentController.getVendorTaxPayments);
router.get('/vendors/:vendorId/payments/history', paymentController.getVendorPaymentHistory);

// Payment processing routes
router.post('/payments/evidence', fileUploadMiddleware, paymentController.uploadPaymentEvidence);
router.post('/payments/rent/record', paymentController.recordRentPayment);
// Online Payment Attempts (Standardized for Frontend)
router.post('/vendors/:vendorId/payments/attempts', paymentController.initializeOnlinePayment);
router.get('/vendors/:vendorId/payments/attempts/:id/status', paymentController.verifyOnlinePayment);
router.get('/vendors/:vendorId/payments/attempts/:id', paymentController.getPaymentAttempt);
router.get('/vendors/:vendorId/payments/attempts', paymentController.listVendorPaymentAttempts);

router.post('/admin/invoices/:invoiceId/fiscalize', paymentController.fiscalizeInvoice);

// Admin payment routes
router.get('/admin/payments/collections', paymentController.getAdminPaymentCollections);
router.get('/admin/payments/outstanding', paymentController.getOutstandingPayments);
router.get('/admin/payments/vendors', paymentController.getScopedVendorsWithPayments);
router.post('/admin/payments/send-reminder', paymentController.sendPaymentReminder);

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
router.post('/vendors/:vendorId/payment-claims', fileUploadMiddleware, billingController.submitVendorPaymentClaim);
router.get('/vendors/:vendorId/payment-claims', billingController.listVendorPaymentClaims);

module.exports = router;
