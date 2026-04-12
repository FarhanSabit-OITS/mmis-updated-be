const express = require('express');
const router  = express.Router();
const authMiddleware    = require('../middleware/auth.middleware');
const documentController = require('../controllers/document.controller');

router.use(authMiddleware);

// ── Existing endpoints ────────────────────────────────────────────────────────
router.get('/',              documentController.getDocuments);
router.get('/alerts',        documentController.getComplianceAlerts);
router.patch('/:id/verify',  documentController.verifyDocument);

// ── KYC Pipeline ─────────────────────────────────────────────────────────────
router.post('/kyc/submit',              documentController.submitKyc);
router.get('/kyc/status',               documentController.getMyKycStatus);
router.get('/kyc/queue',                documentController.getKycQueue);
router.patch('/kyc/:submissionId/review', documentController.reviewKycSubmission);

// ── PDF Downloads ─────────────────────────────────────────────────────────────
router.get('/contract/:contractId/pdf', documentController.downloadShopContract);
router.get('/invoice/:vendorId/pdf',    documentController.downloadInvoice);
router.get('/receipt/:paymentId/pdf',   documentController.downloadReceipt);

// ── Analytics & Forensic Reports ──────────────────────────────────────────────
router.get('/analytics/stats',               documentController.getAnalyticsStats);
router.get('/analytics/:marketId/report/pdf', documentController.downloadMarketReport);
router.get('/forensic/:marketId/pdf',         documentController.downloadForensicReport);

// ── Batch Processing & Verification ──────────────────────────────────────────
router.post('/batch/invoices', documentController.triggerBatchInvoices);
router.get('/verify/:hash',    documentController.verifyDigitalSignature);

module.exports = router;
