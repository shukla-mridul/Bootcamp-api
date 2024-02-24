// Here  fn is a function so we are passing those  try catch methods here as functions and taking the promise

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
