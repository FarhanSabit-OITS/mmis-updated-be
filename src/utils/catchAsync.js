/**
 * Utility to catch asynchronous errors and pass them to the global error handler
 */
const catchAsync = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};

module.exports = catchAsync;
