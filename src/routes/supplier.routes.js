const express = require("express");
const router = express.Router();
const supplierController = require("../controllers/supplier.controller");
const vendorOnboardingController = require("../controllers/vendor.onboarding.controller");
const upload = require("../middleware/upload.middleware");
const { verifyToken, requireRole } = require("../middleware/auth.middleware");

// Protected routes
router.use(verifyToken);

// =====================
// Supplier Onboarding
// =====================
/**
 * Setup Supplier Profile
 * POST /api/suppliers/setup-profile
 * Body: { marketId, businessName, businessType, taxIdNumber }
 * File: tinDocument
 */
router.post("/setup-profile", upload.single("tinDocument"), vendorOnboardingController.setupSupplier);

router.get("/", requireRole(["SuperAdmin", "MarketMaster", "GateCounter"]), supplierController.getSuppliers);
router.get("/:id", requireRole(["SuperAdmin", "MarketMaster", "GateCounter"]), supplierController.getSupplierDetails);
router.post("/", requireRole(["SuperAdmin"]), supplierController.createSupplier);
router.put("/:id", requireRole(["SuperAdmin", "MarketMaster"]), supplierController.editSupplier);
router.delete("/:id", requireRole(["SuperAdmin"]), supplierController.deleteSupplier);

module.exports = router;
