require('dotenv').config();

module.exports = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    name: process.env.DB_NAME || 'sgams',
    user: process.env.DB_USER || 'sgams_user',
    password: process.env.DB_PASSWORD || 'sgams_password',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev_only_insecure_secret_change_me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
