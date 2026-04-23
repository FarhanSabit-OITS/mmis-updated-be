const express = require("express");
const controller = require("../controllers/marketSection.controller");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
router.use(authMiddleware);


router.post("/", controller.create);
router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

module.exports = router;