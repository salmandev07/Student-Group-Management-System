const { verifyToken } = require('../utils/jwt');
const { query } = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Authenticate requests via `Authorization: Bearer <token>`.
 * Attaches the verified payload AND a fresh user record to `req.user`.
 */
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw ApiError.unauthorized('No token provided. Please log in.');
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Session expired. Please log in again.');
    }
    throw ApiError.unauthorized('Invalid token');
  }

  const result = await query('SELECT id, name, email, role, created_at FROM users WHERE id = $1', [
    decoded.id,
  ]);

  if (!result.rows.length) {
    throw ApiError.unauthorized('User belonging to this token no longer exists');
  }

  req.user = result.rows[0];
  next();
});

/** Restrict access to one or more roles. Usage: authorize('admin') */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(ApiError.forbidden());
  }
  next();
};

module.exports = { protect, authorize };
