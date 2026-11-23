const { query } = require('../config/db');
const { hashPassword } = require('../utils/password');
const logger = require('../utils/logger');

const ADMIN_EMAIL = 'professor@joineazy.com';
const ADMIN_PASSWORD = process.env.ADMIN_SEED_PASSWORD || 'Admin@123';

/**
 * Seeds exactly one account: the professor. Students self-register.
 * The existing password is never overwritten, so an OTP reset survives restarts.
 */
const seed = async () => {
  const admin = await query('SELECT id FROM users WHERE email = $1', [ADMIN_EMAIL]);

  if (admin.rows.length) {
    logger.info('Professor account already present in the database.');
    return;
  }

  const passwordHash = await hashPassword(ADMIN_PASSWORD);
  await query(
    `INSERT INTO users (name, email, password_hash, role, student_id)
     VALUES ($1, $2, $3, 'admin', NULL)`,
    ['Dr. Sarah Professor', ADMIN_EMAIL, passwordHash]
  );

  logger.info(`Professor account seeded: ${ADMIN_EMAIL}`);
};

module.exports = seed;
