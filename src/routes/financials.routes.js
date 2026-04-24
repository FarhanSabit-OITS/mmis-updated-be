const express = require("express");
const router = express.Router();
const financialsController = require("../controllers/financials.controller");
const { verifyToken } = require("../middleware/auth.middleware");

router.use(verifyToken);
router.post("/pay", financialsController.processPayment);

module.exports = router;
