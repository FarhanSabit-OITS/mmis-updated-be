const express = require("express");
const router = express.Router();
const rentContractController = require("../controllers/rentContract.controller");
const { verifyToken, requireRole } = require("../middleware/auth.middleware");

// Protected routes
router.use(verifyToken);
router.get("/", requireRole(["SuperAdmin", "MarketMaster", "Vendor"]), rentContractController.getRentContracts);
router.get("/:id", requireRole(["SuperAdmin", "MarketMaster", "Vendor"]), rentContractController.getRentContractDetails);
router.post("/", requireRole(["SuperAdmin", "MarketMaster"]), rentContractController.createRentContract);
router.put("/:id", requireRole(["SuperAdmin", "MarketMaster"]), rentContractController.editRentContract);
router.delete("/:id", requireRole(["SuperAdmin", "MarketMaster"]), rentContractController.deleteRentContract);

module.exports = router;
