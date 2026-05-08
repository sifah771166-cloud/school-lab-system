const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config');

const signToken = (payload) => {
  return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });
};

const verifyToken = (token) => {
  return jwt.verify(token, jwtSecret);
};

module.exports = { signToken, verifyToken };