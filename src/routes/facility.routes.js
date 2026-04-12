const express = require("express");
const router = express.Router();
const { validate } = require("../middleware/validate.middleware");
const { getFacilitiesQuerySchema } = require("../validations/facility.validation");
const facilityController = require("../controllers/facility.controller");

router.get("/", validate(getFacilitiesQuerySchema), facilityController.getFacilities);
router.get("/check-availability", facilityController.checkAvailability);
router.get("/:id", facilityController.getFacilityDetails);
router.patch("/:id", facilityController.editFacility);

module.exports = router;
