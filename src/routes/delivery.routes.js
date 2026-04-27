const express = require("express");
const router = express.Router();
const deliveryController = require("../controllers/delivery.controller");
const { verifyToken, requireRole } = require("../middleware/auth.middleware");

// Protected routes
router.use(verifyToken);
router.get("/", deliveryController.getDeliveries);
router.get("/:id", deliveryController.getDeliveryDetails);
router.post("/", requireRole(["SuperAdmin", "MarketMaster", "Vendor", "GateCounter"]), deliveryController.createDelivery);
router.put("/:id", requireRole(["SuperAdmin", "MarketMaster"]), deliveryController.editDelivery);
router.post("/:id/gate-entry", requireRole(["SuperAdmin", "MarketMaster", "GateCounter"]), deliveryController.recordGateEntry);
router.post("/:id/verify", requireRole(["SuperAdmin", "MarketMaster", "StockCounter"]), deliveryController.verifyStock);

module.exports = router;
