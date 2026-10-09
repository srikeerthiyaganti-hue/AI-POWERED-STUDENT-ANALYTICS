import { logger } from '../utils/logger.js';

export function notFoundHandler(req, res, next) {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
}

export function globalErrorHandler(err, req, res, next) {
  logger.error(`Unhandled error at ${req.method} ${req.originalUrl}:`, err.stack || err.message);

  res.status(err.status || 500).json({
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected server error occurred',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
}
