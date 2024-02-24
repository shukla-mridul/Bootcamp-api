const Course = require("../models/Course");
const ErrorResponse = require("../utils/error");
const asyncHandler = require("../middleware/asyncHandler");
const Bootcamp = require("../models/Bootcamp");

/*  @desc Get all Courses
 @route /api/v1/bootcamps/:bootcampsId/courses
@ access PUBLIC
 */

// Now for populating courses with the bootcamp data we just need to
// add to function of  populate to find and give bootcamp as an parameter
// if we want populate with only some selected fields we need to send the path and select values
// this was easy now it will be the hard part where we need to show array of courses inside the bootcamps
// For that we will be needing virtuals
exports.getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const course = await Course.find({ bootcamp: req.params.bootcampId });

    res.status(200).json({
      success: true,
      count: course.length,
      data: course,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }

  // for specific values from bootcamp
});

/*  @desc Get Single Course
 @route /api/v1/courses/:id
@ access PUBLIC
 */
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return next(
      new ErrorResponse(`Course not found of id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: course });
});

/*  @desc Post Course
 @route /api/v1/bootcamps/:bootcampsId/courses
@ access Private
 */

exports.postCourses = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  const bootcamp = Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp of id ${req.params.id} not found`));
  }
  const newCourse = await Course.create(req.body);

  res.status(200).json({ success: true, data: newCourse });
});
