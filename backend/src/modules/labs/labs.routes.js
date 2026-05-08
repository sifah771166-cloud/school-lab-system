const express = require('express');
const { protect, authorize } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { createLabSchema, updateLabSchema } = require('./lab.validation');
const ctrl = require('./lab.controller');

const router = express.Router();

router.use(protect); // all routes require authentication

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', authorize('SUPER_ADMIN', 'ADMIN_JURUSAN'), validate(createLabSchema), ctrl.create);
router.put('/:id', authorize('SUPER_ADMIN', 'ADMIN_JURUSAN'), validate(updateLabSchema), ctrl.update);
router.delete('/:id', authorize('SUPER_ADMIN', 'ADMIN_JURUSAN'), ctrl.remove);

module.exports = router;
