const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/delivery.controller');
const { verifyJWT, authorizeRoles } = require('../middlewares/auth.middleware');

router.use(verifyJWT);

router.post('/', authorizeRoles('SUPPLIER'), deliveryController.createDelivery);
router.get('/:id', deliveryController.getDeliveryDetails);
router.patch('/:id/verify', authorizeRoles('VENDOR', 'MARKET_ADMIN', 'GATE_STAFF'), deliveryController.verifyDelivery);

module.exports = router;
