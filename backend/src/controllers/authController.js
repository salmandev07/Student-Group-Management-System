const { query } = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const {
  requireFields,
  assertEmail,
  assertPassword,
  assertRole,
} = require('../utils/validate');

const publicUser = ({ id, name, email, role, student_id, created_at }) => ({
  id,
  name,
  email,
  role,
  studentId: student_id,
  createdAt: created_at,
});

/** POST /api/auth/register */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role = 'student', studentId, adminKey } = req.body;
  requireFields(req.body, ['name', 'email', 'password']);
  assertEmail(email);
  assertPassword(password);
  assertRole(role);

  // Privileged accounts require a shared secret so the public form stays safe.
  if (role === 'admin' && adminKey !== (process.env.ADMIN_REGISTRATION_KEY || 'joineazy-admin')) {
    throw ApiError.forbidden('A valid admin registration key is required');
  }

  const duplicate = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  if (duplicate.rows.length) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const passwordHash = await hashPassword(password);
  const result = await query(
    `INSERT INTO users (name, email, password_hash, role, student_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, role, student_id, created_at`,
    [name.trim(), email.toLowerCase().trim(), passwordHash, role, studentId || null]
  );

  const user = publicUser(result.rows[0]);
  const token = signToken(result.rows[0]);

  res.status(201).json({ success: true, token, user });
});

/** POST /api/auth/login */
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

module.exports = { register, login, me };
