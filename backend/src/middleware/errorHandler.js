const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');

/** 404 handler for unmatched routes. */
const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

/** Centralized error responder. */
const errorHandler = (err, req, res, next) => {
  // eslint-disable-next-line no-unused-vars
  const statusCode = err.statusCode || err.status || 500;
  const message = err.isOperational || err.statusCode ? err.message : 'Internal server error';

  if (statusCode >= 500) {
    logger.error(err.stack || err.message);
  } else {
    logger.warn(`${statusCode} ${req.method} ${req.originalUrl} - ${message}`);
  }

  // PostgreSQL unique-violation
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      message: 'A record with these details already exists',
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(err.details ? { details: err.details } : {}),
    ...(process.env.NODE_ENV === 'development' && statusCode >= 500 ? { stack: err.stack } : {}),
  });
};

module.exports = { notFound, errorHandler };
