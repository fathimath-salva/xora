export function notFound(req, res) {
  res.status(404).json({
    success: false,
    code: 'ROUTE_NOT_FOUND',
    message: 'The requested API route was not found.',
    error: { code: 'ROUTE_NOT_FOUND', message: 'The requested API route was not found.' }
  });
}
