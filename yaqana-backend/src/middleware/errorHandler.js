export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  let status = Number.isInteger(error.statusCode) && error.statusCode >= 400 && error.statusCode < 600
    ? error.statusCode
    : 500;
  if (error.name === 'ValidationError' || error.name === 'SyntaxError') status = 400;
  if (error.name === 'CastError') status = 400;
  if (error.code === 11000) status = 409;
  if (error.code === 'LIMIT_FILE_SIZE') status = 413;
  const code = status === 500 ? 'INTERNAL_SERVER_ERROR' : (error.code === 11000 ? 'DUPLICATE_RECORD' : (typeof error.code === 'string' ? error.code : 'REQUEST_FAILED'));
  const message = status === 500 ? 'An unexpected server error occurred.' : (error.code === 11000 ? 'A record with this value already exists.' : error.message);

  if (status >= 500) {
    // Do not expose stack traces, database messages, secrets, or raw provider errors to clients.
    console.error({ event: 'api_error', requestId: req.id, method: req.method, path: req.path, errorName: error.name });
  }

  res.status(status).json({ success: false, code, message, error: { code, message } });
}
