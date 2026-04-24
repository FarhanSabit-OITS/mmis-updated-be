const express = require("express");
const router = express.Router();
const { validate } = require("../middleware/validate.middleware");
const { getGatesQuerySchema, createGateSchema, updateGateSchema } = require("../validations/gate.validation");
const gateController = require("../controllers/gate.controller");
const { verifyToken, requireRole } = require("../middleware/auth.middleware");

router.get("/", validate(getGatesQuerySchema), gateController.getGates);
router.get("/:id", gateController.getGateDetails);

// Protected routes
router.use(verifyToken);
router.post("/", requireRole(["SuperAdmin", "MarketMaster"]), validate(createGateSchema), gateController.createGate);
router.put("/:id", requireRole(["SuperAdmin", "MarketMaster"]), validate(updateGateSchema), gateController.editGate);
router.delete("/:id", requireRole(["SuperAdmin", "MarketMaster"]), gateController.deleteGate);

module.exports = router;
