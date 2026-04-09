const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/my', orderController.getMyOrders);
router.get('/:id', orderController.getOrderDetails);

module.exports = router;
