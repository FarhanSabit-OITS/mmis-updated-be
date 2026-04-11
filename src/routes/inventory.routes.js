const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');

const validate = require('../middleware/validate.middleware').validate;
const { movementSchema } = require('../validations/inventory.validation');

router.post('/movements', validate(movementSchema), inventoryController.recordMovement);
router.get('/movements/:marketId', inventoryController.getMarketMovements);
router.get('/summary/:marketId', inventoryController.getMarketStockSummary);

module.exports = router;
