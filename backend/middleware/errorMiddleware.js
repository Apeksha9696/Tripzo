/**
 * 404 Route Not Found Middleware
 * Responds to unknown endpoints with a standard JSON 404 message
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Global Error Boundary Middleware
 * Catches all async try-catch fallbacks and unhandled runtime exceptions
 */
const globalErrorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Clean, structured error logger
  console.error(`🚨 [ERROR] [${new Date().toISOString()}] ${req.method} ${req.originalUrl} - Status: ${statusCode} - Message: ${err.message}`);
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    console.error(err.stack);
  }

  // Construct JSON error response
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
};

module.exports = {
  notFoundHandler,
  globalErrorHandler
};
