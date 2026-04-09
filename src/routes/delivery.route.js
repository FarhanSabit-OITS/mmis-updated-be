const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/delivery.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.post('/', deliveryController.createDelivery);
router.get('/:id', deliveryController.getDeliveryDetails);
router.patch('/:id/verify', deliveryController.verifyDelivery);

module.exports = router;
