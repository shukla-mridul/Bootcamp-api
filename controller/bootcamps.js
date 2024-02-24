const path = require("path");
const Bootcamp = require("../models/Bootcamp");
const ErrorResponse = require("../utils/error");
const geocoder = require("../utils/geocoder");
const asyncHandler = require("../middleware/asyncHandler");
const { geocode } = require("../utils/geocoder");

const MAX_FILE_UPLOAD_SIZE = 1000000;

const FILE_PATH = "./public/uploads";

/* Lets make the controllers method for defferent routes now

@desc Get all bootcamps
 @route /api/v1/bootcamps/
@ access PUBLIC

Now listen instead of taking try and catch block on each method what we can do is
make a async handler and pass these function in tht

*/

/* I have kept one try and catch method as a refernce 
exports.getBootcamps = async (req, res, next) => {
  try {
    const bootcamps = await Bootcamp.find();
    res.status(200).json({ succes: "true", data: bootcamps });
  } catch (err) {
    next(err);
  }
};
*/

exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc Get Single bootcamp
//  @route /api/v1/bootcamps/:id
// @ access PUBLIC

/*
Refernce -->

exports.getBootcamp = async (req, res, next) => {
  // try {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
      console.log(21);
      return next(
        new ErrorResponse(`Bootcamp not found of id ${req.params.id}`, 404)
      );
    
    res.status(200).json({ succes: "true", data: bootcamp });
  } catch (err) {
    // res.status(400).json({ succes: false, data: null });
    console.log(23);
    // BY default it will send a 500 status and a html page with the error description
    next(err);
  }
};*/

exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    console.log(21);
    return next(
      new ErrorResponse(`Bootcamp not found of id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ succes: "true", data: bootcamp });
});

// @desc Post bootcamps
//  @route /api/v1/bootcamps/
// @ access Private

exports.postBootcamps = asyncHandler(async (req, res, next) => {
  // NOw as you know we aint gonna submit the user id in the body therefore we must get that from other way
  // and that way will be the middleware Protect where we confirm the user id

  // Check for published bootcamps by the publisher

  const publishedBootcamps = await Bootcamp.findOne({ user: req.user.id });
  // Now if a user is not an admin it can only submit one bootcamp

  if (publishedBootcamps && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `heya u glutton , cant add more bootcamps ya bitch ${req.user.id}`,
        400
      )
    );
  }
  req.body.user = req.user.id;
  const newBootCamp = await Bootcamp.create(req.body);
  res.status(200).json({ succes: "true", data: newBootCamp });
});

// @desc Update bootcamps
//  @route /api/v1/bootcamps/:id
// @ access Private

exports.updateBootcamps = asyncHandler(async (req, res, next) => {
  // const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
  //   new: true,
  //   runValidators: true,
  // });

  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found of id ${req.params.id}`, 404)
    );
  }

  // Make sure the owner is the only one updating the bootcamp
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(`User of id  ${req.user.id} cant update the bootcamp`)
    );
  }

  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ succes: true, data: bootcamp });
});

// @desc Delete bootcamps
//  @route /api/v1/bootcamps/:id
// @ access Private

exports.deleteBootcamps = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found of id ${req.params.id}`, 404)
    );
  }

  // Make sure the owner is the only one updating the bootcamp
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(`User of id  ${req.user.id} cant update the bootcamp`)
    );
  }
  bootcamp.remove();
  res.status(200).json({ succes: true, data: {} });
});

// @desc To PUT req and upload a image in the bootcamp
// @route PUT /api/v1/bootcamps/:id/photo
exports.uploadImageBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found of id ${req.params.id}`, 404)
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please uplaod an image `, 400));
  }

  const file = req.files.file;
  // file is a image

  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please uplaod an image file type`, 400));
  }
  // Check File size
  if (!file.size > MAX_FILE_UPLOAD_SIZE) {
    return next(
      new ErrorResponse(`Please uplaod an image less than 1 mb`, 400)
    );
  }

  // Create custom file name as if someone else upload an image wwith the same name itt will be overwrite
  // to get the file extension we use path
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
  // Upload file to the current path
  file.mv(`${FILE_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.log(err);
      return next(new ErrorResponse(`Problem in uploading the image`, 500));
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({ success: true, data: file.name });
  });

  console.log(file.name);
});

// @desc To GET Bootcamps within ceratin radius
// @route radius/:zipcode/:radius

exports.getBootCampsWithinRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;
  // Lets get the longitude and latitude from geocoder

  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const long = loc[0].longitude;

  // Calculate radius using radius
  // Dive dist by earths radius
  // Earth radius in miles = 3663 miles / 6378km

  const radius = distance / 3663;

  const bootcamp = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[long, lat], radius] } },
  });

  res
    .status(200)
    .json({ succes: true, count: bootcamp.length, data: bootcamp });
});
