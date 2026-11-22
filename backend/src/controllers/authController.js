const crypto = require('crypto');
const { query, withTransaction } = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { requireFields, assertEmail, assertPassword } = require('../utils/validate');

const publicUser = ({ id, name, email, role, student_id, created_at }) => ({
  id,
  name,
  email,
  role,
  studentId: student_id,
  createdAt: created_at,
});

/**
 * POST /api/auth/register
 * Public registration always creates a STUDENT. Admin accounts are pre-seeded,
 * so there is no way for a student to escalate their own role.
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, studentId } = req.body;
  requireFields(req.body, ['name', 'email', 'password']);
  assertEmail(email);
  assertPassword(password);

  const duplicate = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  if (duplicate.rows.length) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const passwordHash = await hashPassword(password);
  const result = await query(
    `INSERT INTO users (name, email, password_hash, role, student_id)
     VALUES ($1, $2, $3, 'student', $4)
     RETURNING id, name, email, role, student_id, created_at`,
    [name.trim(), email.toLowerCase().trim(), passwordHash, studentId || null]
  );

  const user = publicUser(result.rows[0]);
  res.status(201).json({
    success: true,
    message: 'Student account created',
    token: signToken(result.rows[0]),
    user,
  });
});

/** POST /api/auth/login — one endpoint for both roles; role comes from the DB. */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  requireFields(req.body, ['email', 'password']);

  const result = await query('SELECT * FROM users WHERE email = $1', [
    String(email).toLowerCase().trim(),
  ]);
  const user = result.rows[0];

  if (!user || !(await comparePassword(password, user.password_hash))) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  res.json({ success: true, token: signToken(user), user: publicUser(user) });
});

/** GET /api/auth/me */
const me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: publicUser(req.user) });
});

/**
 * POST /api/auth/forgot-password
 * Generates a single-use, 15-minute reset token. For this demo the token is
 * returned in the response; in production it would be emailed instead.
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  requireFields(req.body, ['email']);
  assertEmail(email);

  const result = await query('SELECT id FROM users WHERE email = $1', [
    String(email).toLowerCase().trim(),
  ]);

  if (!result.rows.length) {
    // Same message whether or not the account exists (no account enumeration).
    return res.json({
      success: true,
      message: 'If that email is registered, a reset token has been generated.',
    });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const ttl = Number(process.env.RESET_TOKEN_TTL_MINUTES) || 15;

  await query(
    `INSERT INTO password_resets (user_id, token_hash, expires_at)
     VALUES ($1, $2, NOW() + ($3::int * INTERVAL '1 minute'))`,
    [result.rows[0].id, tokenHash, ttl]
  );

  res.json({
    success: true,
    message: 'Reset token generated. Use it below to set a new password.',
    resetToken: token,
    expiresInMinutes: ttl,
  });
});

/** POST /api/auth/reset-password — exchanges a valid token for a new password. */
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  requireFields(req.body, ['token', 'password']);
  assertPassword(password);

  const tokenHash = crypto.createHash('sha256').update(String(token)).digest('hex');
  const found = await query(
    `SELECT id, user_id FROM password_resets
     WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()`,
    [tokenHash]
  );
  if (!found.rows.length) {
    throw ApiError.badRequest('This reset token is invalid or has expired');
  }

  const newHash = await hashPassword(password);
  await withTransaction(async (client) => {
    await client.query('UPDATE users SET password_hash = $1 WHERE id = $2', [
      newHash,
      found.rows[0].user_id,
    ]);
    await client.query('UPDATE password_resets SET used_at = NOW() WHERE id = $1', [
      found.rows[0].id,
    ]);
  });

  res.json({ success: true, message: 'Password updated. You can now sign in.' });
});

module.exports = { register, login, me, forgotPassword, resetPassword };
