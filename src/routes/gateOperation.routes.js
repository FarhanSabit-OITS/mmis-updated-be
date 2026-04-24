const express = require("express");
const router = express.Router();
const gateOperationController = require("../controllers/gateOperation.controller");
const { verifyToken, requireRole } = require("../middleware/auth.middleware");

// Protected routes
router.use(verifyToken);
router.get("/", gateOperationController.getGateOperations);
router.get("/:id", gateOperationController.getGateOperationDetails);
router.post("/", requireRole(["SuperAdmin", "MarketMaster", "GateCounter", "GATE_COUNTER"]), gateOperationController.createGateOperation);

module.exports = router;
