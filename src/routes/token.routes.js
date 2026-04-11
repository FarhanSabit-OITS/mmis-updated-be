const express = require('express');
const router = express.Router();
const tokenController = require('../controllers/token.controller');
const authMiddleware = require('../middleware/auth.middleware');
const scopeMiddleware = require('../middleware/scope.middleware');

// All token routes require authentication
// We apply scopeMiddleware to routes that should be restricted to the user's market/jurisdiction
router.post('/entry',              authMiddleware, scopeMiddleware, tokenController.generateEntryToken);
router.get('/parking-status',      authMiddleware, scopeMiddleware, tokenController.getParkingStatus);
router.get('/:code',               authMiddleware, scopeMiddleware, tokenController.getTokenDetails);
router.post('/dispatch',           authMiddleware, scopeMiddleware, tokenController.recordStockDispatch);
router.post('/tax',                authMiddleware, scopeMiddleware, tokenController.recordTax);
router.post('/parking',            authMiddleware, scopeMiddleware, tokenController.recordParking);
router.post('/receipt',            authMiddleware, scopeMiddleware, tokenController.recordStockReceipt);
router.post('/supplier-delivery',  authMiddleware, scopeMiddleware, tokenController.generateSupplierDeliveryToken);
router.post('/exit',               authMiddleware, scopeMiddleware, tokenController.recordExit);

// ── Trust Handshake ───────────────────────────────────────────────────────────
router.post('/verify-identity',    authMiddleware, scopeMiddleware, tokenController.verifyIdentity);

// ── PDF Downloads ────────────────────────────────────────────────────────────
router.get('/:code/pdf',                       authMiddleware, tokenController.downloadTokenPdf);
router.get('/kyc-certificate/:stakeholderId',  authMiddleware, tokenController.downloadKycCertificate);

module.exports = router;

