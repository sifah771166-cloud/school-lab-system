const express = require('express');
const { register, login } = require('./auth.controller');
const validate = require('../../middleware/validate');
const { registerSchema, loginSchema } = require('./auth.validation');
const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

// Register hanya bisa dilakukan oleh super admin
router.post('/register', protect, authorize('SUPER_ADMIN'), validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

module.exports = router;