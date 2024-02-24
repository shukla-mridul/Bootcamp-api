// This middelware will be used to protect the routes
const jwt = require("jsonwebtoken"); /**TO verify the token */
const JWT_SECRET =
  "dshfihaewuhfawehinsaijncjns0"; /**RANDOM STRING DONT THINK ABOUT IT  */
const asyncHandler = require("./asyncHandler");
const ErrorResponse = require("../utils/error");
const User = require("../models/User");

/**  req.headers.authorization.startsWith('Bearer')  Its just a naming convention we will be fine without bearer too but it is professional
 * Now what happens is that token is stored something like this in  the header
 *
 * authorization: Bearer idhsaufuiashuisniucmiuscniijicndisiurhifhriuwn
 * therefore we split token with the ' ' and then  take the index 1 with token without the bearer
 */
// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Make sure token exists

  if (!token) {
    return next(
      new ErrorResponse("Invalid credentials mate , u aint a hacker yet", 401)
    );
  }
  // To veriffy the token
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log(decoded);

    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    return next(
      new ErrorResponse("Invalid credentials mate , u aint a hacker yet", 401)
    );
  }
});

// Whereever you want to use this middleware just send it as a first parameter in the route

// DEFINE USER ROLES

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(`user role of ${req.user.role} is not authorized`)
      );
    }
    next();
  };
};
