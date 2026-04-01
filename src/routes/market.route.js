const express = require("express");
const router = express.Router();
const marketController = require("../controllers/market.controller");
const { validate } = require("../middleware/validate.middleware");
const { 
    createMarketSchema, 
    updateGeneralSchema, 
    updateOperatingSchema, 
    updateCapacitySchema,
    getMarketListSchema
} = require("../validations/index.js");


router.get(
  "/",
  validate(getMarketListSchema),
  marketController.getMarketList
);
router.post("/", validate(createMarketSchema), marketController.createMarket);

router.patch("/:marketId/general", validate(updateGeneralSchema), marketController.updateGeneralInfo);
router.patch("/:marketId/operating", validate(updateOperatingSchema), marketController.updateOperatingInfo);
router.patch("/:marketId/capacity", validate(updateCapacitySchema), marketController.updateCapacityInfo);

router.get("/:marketId", marketController.getMarket);

module.exports = router;