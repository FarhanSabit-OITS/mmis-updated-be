/**
 * Global Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Development Error Info
  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }

  // Production Error Info (Clean, User-Friendly)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }

  // Programming or Unknown Error: don't leak details
  console.error('🔥 ERROR 💥', err);
  return res.status(500).json({
    success: false,
    message: 'Something went very wrong!'
  });
};

module.exports = errorHandler;