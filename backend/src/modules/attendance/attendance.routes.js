const express = require('express');
const { protect, authorize } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { createKunjunganSchema, updateKunjunganSchema } = require('./attendance.validation');
const ctrl = require('./attendance.controller');

const router = express.Router();

router.use(protect); // all routes require authentication

// Get all kunjungan (with optional search)
router.get('/', ctrl.getAll);

// Create kunjungan
router.post('/', validate(createKunjunganSchema), ctrl.create);

// Update kunjungan
router.put('/:id', validate(updateKunjunganSchema), ctrl.update);

// Delete kunjungan (admin only)
router.delete('/:id', authorize('SUPER_ADMIN', 'ADMIN_JURUSAN'), ctrl.delete);

module.exports = router;