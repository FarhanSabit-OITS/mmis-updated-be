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

// Infrastructure Sub-resources
router.post("/:marketId/levels", marketController.addLevel);
router.post("/:marketId/sections", marketController.addSection);
router.post("/sections/:sectionId/aisles", marketController.addAisle);
router.post("/:marketId/gates", marketController.addGate);
router.get("/:marketId/stakeholders", marketController.getMarketStakeholders);

module.exports = router;