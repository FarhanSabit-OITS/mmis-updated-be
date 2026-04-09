const express = require('express');
const router = express.Router();
const tokenController = require('../controllers/token.controller');
const authMiddleware = require('../middleware/auth.middleware');

// All token routes require authentication
router.post('/entry',              authMiddleware, tokenController.generateEntryToken);
router.get('/:code',               authMiddleware, tokenController.getTokenDetails);
router.post('/dispatch',           authMiddleware, tokenController.recordStockDispatch);
router.post('/tax',                authMiddleware, tokenController.recordTax);
router.post('/parking',            authMiddleware, tokenController.recordParking);
router.post('/receipt',            authMiddleware, tokenController.recordStockReceipt);
router.post('/supplier-delivery',  authMiddleware, tokenController.generateSupplierDeliveryToken);
router.post('/exit',               authMiddleware, tokenController.recordExit);

// ── NEW: PDF Downloads ────────────────────────────────────────────────────────
router.get('/:code/pdf',                       authMiddleware, tokenController.downloadTokenPdf);
router.get('/kyc-certificate/:stakeholderId',  authMiddleware, tokenController.downloadKycCertificate);

module.exports = router;

