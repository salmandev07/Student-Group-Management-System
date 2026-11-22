const { Pool } = require('pg');
const logger = require('../utils/logger');

/**
 * Shared PostgreSQL connection pool.
 * Credentials come from environment variables (see .env.example).
 */
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'sgams',
  user: process.env.DB_USER || 'sgams_user',
  password: process.env.DB_PASSWORD || 'sgams_password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('connect', () => {
  logger.info('New PostgreSQL client connected');
});

pool.on('error', (err) => {
  logger.error('Unexpected PostgreSQL pool error:', err.message);
});

/**
 * Convenience wrapper around pool.query with basic query logging in dev.
 */
const query = (text, params) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug('SQL:', text.replace(/\s+/g, ' ').trim());
  }
  return pool.query(text, params);
};

/**
 * Run a callback inside a single transaction.
 * The client is always released, and the transaction rolls back on error.
 */
const withTransaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = { pool, query, withTransaction };
