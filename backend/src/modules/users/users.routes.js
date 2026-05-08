const express = require('express');
const { protect } = require('../../middleware/auth');
const { getMe } = require('./users.controller');

const router = express.Router();

// Protected profile route (any logged-in user)
router.get('/me', protect, getMe);

module.exports = router;