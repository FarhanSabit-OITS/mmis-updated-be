const express = require('express');
const router = express.Router();
const assetController = require('../controllers/asset.controller');

router.post('/', assetController.createAsset);
router.get('/market/:marketId', assetController.getMarketAssets);
router.put('/:id', assetController.updateAsset);
router.delete('/:id', assetController.deleteAsset);

module.exports = router;
