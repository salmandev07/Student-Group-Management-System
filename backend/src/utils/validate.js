const ApiError = require('./ApiError');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Throw an ApiError(400) when any required field is missing/empty. */
const requireFields = (body, fields) => {
  const missing = fields.filter(
    (f) => body[f] === undefined || body[f] === null || String(body[f]).trim() === ''
  );
  if (missing.length) {
    throw ApiError.badRequest(`Missing required field(s): ${missing.join(', ')}`);
  }
};

const assertEmail = (email) => {
  if (!EMAIL_RE.test(String(email || '').trim())) {
    throw ApiError.badRequest('A valid email address is required');
  }
};

const assertPassword = (password) => {
  if (String(password || '').length < 6) {
    throw ApiError.badRequest('Password must be at least 6 characters long');
  }
};

const assertRole = (role) => {
  if (!['student', 'admin'].includes(role)) {
    throw ApiError.badRequest('Role must be either "student" or "admin"');
  }
};

const assertDate = (value, fieldName = 'dueDate') => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    throw ApiError.badRequest(`${fieldName} must be a valid date`);
  }
  return d;
};

module.exports = { requireFields, assertEmail, assertPassword, assertRole, assertDate };
