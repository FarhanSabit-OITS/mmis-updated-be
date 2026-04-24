const express = require("express");
const router = express.Router();
const { validate } = require("../middleware/validate.middleware");
const { getShopsQuerySchema, createShopSchema } = require("../validations/shop.validation");
const shopController = require("../controllers/shop.controller");

router.post("/", validate(createShopSchema), shopController.createShop);
router.get("/", validate(getShopsQuerySchema), shopController.getShops);
router.get("/:id", shopController.getShopDetails);
router.put("/:id", shopController.editShop);
router.delete('/:id', shopController.deleteShop);

module.exports = router;