const jwt = require('jsonwebtoken');
const config = require('../config');

/** Sign a JWT containing the user's id and role. */
const signToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role, name: user.name, email: user.email },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

/** Verify and decode a JWT. Throws if invalid or expired. */
const verifyToken = (token) => jwt.verify(token, config.jwt.secret);

module.exports = { signToken, verifyToken };
