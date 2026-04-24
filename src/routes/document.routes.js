const express = require("express");
const router = express.Router();
const documentController = require("../controllers/document.controller");
const upload = require("../middleware/upload.middleware");
const { verifyToken, requireRole } = require("../middleware/auth.middleware");

// Protected routes
router.use(verifyToken);
router.post("/upload", upload.single("file"), documentController.uploadDocument);
router.get("/", documentController.getDocuments);
router.get("/:id", documentController.getDocumentDetails);
router.put("/:id/verify", requireRole(["SuperAdmin", "MarketMaster"]), documentController.verifyDocument);

module.exports = router;
