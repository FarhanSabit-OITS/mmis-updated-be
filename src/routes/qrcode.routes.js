const express = require("express");
const router = express.Router();
const qrcodeController = require("../controllers/qrcode.controller");
const { verifyToken } = require("../middleware/auth.middleware");

router.use(verifyToken);

router.post("/generate", qrcodeController.generateQrCode);
router.post("/scan", qrcodeController.scanQrCode);
router.get("/:configId", qrcodeController.getQrCodeConfig);

module.exports = router;
