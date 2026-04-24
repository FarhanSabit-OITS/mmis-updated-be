const express = require("express");
const router = express.Router();
const { validate } = require("../middleware/validate.middleware");
const { getShopsQuerySchema, createShopSchema, updateShopSchema } = require("../validations/shop.validation");
const shopController = require("../controllers/shop.controller");
const { verifyToken, requireRole } = require("../middleware/auth.middleware");

router.get("/", validate(getShopsQuerySchema), shopController.getShops);
router.get("/:id", shopController.getShopDetails);

// Protected routes
router.use(verifyToken);
router.post("/", requireRole(["SuperAdmin", "MarketMaster"]), validate(createShopSchema), shopController.createShop);
router.put("/:id", requireRole(["SuperAdmin", "MarketMaster"]), validate(updateShopSchema), shopController.editShop);
router.delete("/:id", requireRole(["SuperAdmin", "MarketMaster"]), shopController.deleteShop);

module.exports = router;