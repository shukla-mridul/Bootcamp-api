const ErrorResponse = require("../utils/error");
const asyncHandler = require("../middleware/asyncHandler");
const User = require("../models/User");
const sendEmail = require("../utils/nodemailer");
const crypto = require("crypto");
// @description User registrtion
// @route Post /api/v1/auth/register
//@ access public

exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  console.log(user);

  //   Create Token
  sendTokenResponse(user, 200, res);
});

// @desc      Login user
// @route     POST /api/v1/auth/login
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate emil & password
  if (!email || !password) {
    return next(new ErrorResponse("Please provide an email and password", 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc get your current user
// @route GET /api/v1/auth/me
// @access private

exports.getme = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc for forgotpassword
// @route POST /api/v1/auth/forgotpassword
// @access public

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new ErrorResponse("Error ! There is no user with this email", 404)
    );
  }
  // Getting resettoken

  const resetToken = user.getResetPasswordToken();

  console.log(resetToken);
  await user.save({ validateBeforeSave: false });

  // create reset url ;
  // const resetURL = `${req.protocol}://${req.get('host)}/api/v1/resetPassword/${resetToken}`
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/resetpassword/${resetToken}`;
  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset token",
      message,
    });

    res.status(200).json({ success: true, data: "Email sent!!" });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return new ErrorResponse(" Email could not be sent ", 500);
  }

  res.status(200).json({ success: true, data: user });
});

// @reset passwordURL
//  @route Put /api/v1/auth/resetpassword/:resettoken

exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Now for this we need to hash the token we get from the params to match as it is stored in hashed form in the
  // database

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  // Get the user

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse(`Invalid token `, 400));
  }

  // Set the new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res);
});
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  const options = {
    expires: new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ) /**Cokkies expiration date  */,
    httpOnly: true,
  };

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, token: token });
};
