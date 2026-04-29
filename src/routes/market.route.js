const express = require("express");
const router = express.Router();
const marketController = require("../controllers/market.controller");
const { validate } = require("../middleware/validate.middleware");
const { createMarketSchema } = require("../validations/create-market.validation.js");


router.get(
  "/",
  marketController.getMarketList
)
router.get("/market-name-list", marketController.getMarketNameList)
router.post("/", validate(createMarketSchema), marketController.createMarket);
router.put("/:marketId", validate(createMarketSchema), marketController.updateMarket);

router.get("/:marketId", marketController.getMarket);
router.delete("/:marketId", marketController.deleteMarket);

module.exports = router;