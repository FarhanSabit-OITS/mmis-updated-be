const express = require("express");
const router = express.Router();
const { validate } = require("../middleware/validate.middleware");
const { getShopsQuerySchema } = require("../validations/shop.validation");
const shopController = require("../controllers/shop.controller");

router.get("/", validate(getShopsQuerySchema), shopController.getShops);
router.get("/:id", shopController.getShopDetails);

module.exports = router;