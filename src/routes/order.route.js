const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { verifyJWT, authorizeRoles } = require('../middlewares/auth.middleware');

router.use(verifyJWT);

router.get('/my', orderController.getMyOrders);
router.get('/:id', orderController.getOrderDetails);
router.patch('/:id/status', authorizeRoles('VENDOR', 'SUPPLIER'), orderController.updateOrderStatus);

module.exports = router;
