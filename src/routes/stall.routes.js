const express = require("express");
const router = express.Router();
const { validate } = require("../middleware/validate.middleware");
const { getStallsQuerySchema, createStallSchema, updateStallSchema } = require("../validations/stall.validation");
const stallController = require("../controllers/stall.controller");
const { verifyToken, requireRole } = require("../middleware/auth.middleware");

router.get("/", validate(getStallsQuerySchema), stallController.getStalls);
router.get("/:id", stallController.getStallDetails);

// Protected routes
router.use(verifyToken);
router.post("/", requireRole(["SuperAdmin", "MarketMaster"]), validate(createStallSchema), stallController.createStall);
router.put("/:id", requireRole(["SuperAdmin", "MarketMaster"]), validate(updateStallSchema), stallController.editStall);
router.delete("/:id", requireRole(["SuperAdmin", "MarketMaster"]), stallController.deleteStall);

module.exports = router;
