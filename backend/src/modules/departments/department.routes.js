const express = require('express');
const { protect, authorize } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { createDepartmentSchema, updateDepartmentSchema } = require('./department.validation');
const ctrl = require('./department.controller');

const router = express.Router();

router.use(protect); // all routes require authentication

router.get('/', authorize('SUPER_ADMIN', 'ADMIN_JURUSAN'), ctrl.getAll);
router.get('/:id', authorize('SUPER_ADMIN', 'ADMIN_JURUSAN'), ctrl.getById);
router.post('/', authorize('SUPER_ADMIN'), validate(createDepartmentSchema), ctrl.create);
router.put('/:id', authorize('SUPER_ADMIN', 'ADMIN_JURUSAN'), validate(updateDepartmentSchema), ctrl.update);
router.delete('/:id', authorize('SUPER_ADMIN'), ctrl.remove);

module.exports = router;