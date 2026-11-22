const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');
const logger = require('../utils/logger');
const seed = require('./seed');

const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

const initDb = async ({ close = false } = {}) => {
  try {
    logger.info('Applying database schema...');
    await pool.query(schema);
    await seed();
  } catch (error) {
    logger.error('Database initialization failed:', error.message);
    if (close) process.exitCode = 1;
    else throw error;
  } finally {
    if (close) await pool.end();
  }
};

if (require.main === module) {
  initDb({ close: true });
}

module.exports = initDb;
