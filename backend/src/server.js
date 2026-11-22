const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger');
const initDb = require('./db/init');

const start = async () => {
  try {
    // Apply schema + idempotent demo seed so a fresh container "just works".
    await initDb();

    const server = app.listen(config.port, () => {
      logger.info(`SGAMS API running on http://localhost:${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
    });

    const shutdown = (signal) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(() => process.exit(0));
    };
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    logger.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

start();
