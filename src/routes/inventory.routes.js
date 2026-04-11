const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');

router.post('/movements', inventoryController.recordMovement);
router.get('/movements/:marketId', inventoryController.getMarketMovements);
router.get('/summary/:marketId', inventoryController.getMarketStockSummary);

module.exports = router;
