const express = require("express");
const {
  getBootcamps,
  postBootcamps,
  getBootcamp,
  updateBootcamps,
  deleteBootcamps,
  getBootCampsWithinRadius,
  uploadImageBootcamp,
} = require("../controller/bootcamps");

const { protect, authorize } = require("../middleware/auth");
const Bootcamp = require("../models/Bootcamp");
const advancedResults = require("../middleware/advancedResults");

// Include other resources routes
const courseRouter = require("./courses");

const router = express.Router();

//  Re-route into other resources remeber here we used "use" not route

router.use("/:bootcampId/courses", courseRouter);

router.route("/radius/:zipcode/:distance").get(getBootCampsWithinRadius);
router.route("/:id/photo").put(protect, uploadImageBootcamp);
router
  .route("/")
  .get(advancedResults(Bootcamp, "courses"), getBootcamps)
  .post(protect, authorize("publisher", "admin"), postBootcamps);

// router.route("/:id").get(getBootcamp);
router
  .route("/:id")
  .get(getBootcamp)
  .put(protect, updateBootcamps)
  .delete(protect, authorize("publisher", "admin"), deleteBootcamps);
// router.route("/:id").delete(deleteBootcamps);

module.exports = router;
