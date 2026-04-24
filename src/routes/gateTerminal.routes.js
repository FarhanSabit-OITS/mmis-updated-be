const express = require("express");
const router = express.Router();
const gateTerminalController = require("../controllers/gateTerminal.controller");
const { verifyToken } = require("../middleware/auth.middleware");

router.get("/fees", gateTerminalController.getFees);

// Operations require authentication (Gate Counter or Admin)
router.use(verifyToken);
router.post("/entry", gateTerminalController.createEntry);
router.post("/scan-exit", gateTerminalController.scanExit);
router.post("/exit", gateTerminalController.processExit);
router.get("/logs", gateTerminalController.getLogs);

module.exports = router;
