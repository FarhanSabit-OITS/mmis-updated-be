const express = require('express');
const router = express.Router();
const requisitionController = require('../controllers/requisition.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

// Vendor Requisition routes
router.post('/vendor', requisitionController.createRequisition);
router.get('/vendor', requisitionController.getVendorRequisitions);
router.post('/vendor/:requisitionId/accept-bid', requisitionController.acceptBid);

// Supplier Bidding routes
router.get('/supplier/open', requisitionController.getOpenRequisitions);
router.post('/supplier/:requisitionId/bid', requisitionController.placeBid);
router.get('/supplier/bids', requisitionController.getSupplierBids);

// Supplier Directory
router.get('/suppliers', requisitionController.getSuppliers);

module.exports = router;
