const ErrorResponse = require("../utils/error");

const ErrorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  console.log(err);

  //   Mongoose Bad Id
  console.log(err.name);

  if (err.name === "CastError") {
    const message = `Resource of id not found ${err.value}`;
    error = new ErrorResponse(message, 404);
  }
  //   Mongoose duplicate key
  if (err.code === 11000) {
    const message = `Already have a bootcamp of name ${err.keyValue.name}`;
    error = new ErrorResponse(message, 404);
  }

  //   Mongoose validation error if any field is not present

  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message, 400);
  }
  res
    .status(error.statusCode || 500)
    .json({ success: false, error: error.message || "Server Error" });
};

module.exports = ErrorHandler;
