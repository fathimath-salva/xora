export const notFound = (req, res, next) => {
  const error = new Error(`Resource not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;
  if (err.statusCode && err.statusCode >= 400 && err.statusCode < 500) statusCode = err.statusCode;

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found with the specified identifier.';
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }

  // Handle Mongoose Duplicate Key
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `An entry with that ${field} already exists.`;
  }

  if (statusCode >= 500 && process.env.NODE_ENV === 'production') message = 'An unexpected server error occurred.';
  res.status(statusCode).json({
    success: false,
    message: message || 'An unexpected server error occurred.',
    ...(process.env.NODE_ENV === 'production' ? {} : { stack: err.stack })
  });
};
