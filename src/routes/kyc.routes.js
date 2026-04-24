const express = require("express");
const router = express.Router();
const kycController = require("../controllers/kyc.controller");
const { verifyToken, requireRole } = require("../middleware/auth.middleware");

// Protected routes
router.use(verifyToken);
router.post("/submit", kycController.submitKyc);
router.get("/status", kycController.getKycDetail); // Alias for current user status
router.get("/:stakeholderId", kycController.getKycDetail);
router.post("/review", requireRole(["SuperAdmin", "MarketMaster"]), kycController.reviewKyc);

module.exports = router;
