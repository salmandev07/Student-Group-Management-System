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

const hashOtp = (otp) => crypto.createHash('sha256').update(String(otp)).digest('hex');

/**
 * POST /api/auth/register
 * Public registration always creates a STUDENT. The professor account is
 * pre-seeded, so nobody can register an admin account themselves.
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

/** POST /api/auth/login — one endpoint for both roles; the role comes from the DB. */
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
 * Issues a 6-digit OTP valid for a short window. For this demo the OTP is
 * returned in the response; in production it would be delivered by SMS/email.
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  requireFields(req.body, ['email']);
  assertEmail(email);

  const result = await query('SELECT id FROM users WHERE email = $1', [
    String(email).toLowerCase().trim(),
  ]);

  if (!result.rows.length) {
    return res.json({
      success: true,
      message: 'If that email is registered, an OTP has been generated.',
    });
  }

  const otp = String(crypto.randomInt(100000, 1000000));
  const ttl = Number(process.env.OTP_TTL_MINUTES) || 10;

  await query(
    `INSERT INTO password_resets (user_id, otp_hash, expires_at)
     VALUES ($1, $2, NOW() + ($3::int * INTERVAL '1 minute'))`,
    [result.rows[0].id, hashOtp(otp), ttl]
  );

  res.json({
    success: true,
    message: 'OTP generated. Use it to set a new password.',
    otp,
    expiresInMinutes: ttl,
  });
});

/** POST /api/auth/reset-password — exchanges a valid OTP for a new password. */
const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, password } = req.body;
  requireFields(req.body, ['email', 'otp', 'password']);
  assertEmail(email);
  assertPassword(password);

  const userRes = await query('SELECT id FROM users WHERE email = $1', [
    String(email).toLowerCase().trim(),
  ]);
  if (!userRes.rows.length) {
    throw ApiError.badRequest('Invalid or expired OTP');
  }

  const otpRes = await query(
    `SELECT id, otp_hash, attempts FROM password_resets
     WHERE user_id = $1 AND used_at IS NULL AND expires_at > NOW() AND attempts < 5
     ORDER BY created_at DESC LIMIT 1`,
    [userRes.rows[0].id]
  );
  if (!otpRes.rows.length) {
    throw ApiError.badRequest('OTP has expired. Request a new one.');
  }

  const entry = otpRes.rows[0];
  if (entry.otp_hash !== hashOtp(otp)) {
    await query('UPDATE password_resets SET attempts = attempts + 1 WHERE id = $1', [entry.id]);
    throw ApiError.badRequest('Incorrect OTP');
  }

  const passwordHash = await hashPassword(password);
  await withTransaction(async (client) => {
    await client.query('UPDATE users SET password_hash = $1 WHERE id = $2', [
      passwordHash,
      userRes.rows[0].id,
    ]);
    await client.query('UPDATE password_resets SET used_at = NOW() WHERE id = $1', [entry.id]);
  });

  res.json({ success: true, message: 'Password updated. You can now sign in.' });
});

module.exports = { register, login, me, forgotPassword, resetPassword };
