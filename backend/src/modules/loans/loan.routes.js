const express = require('express');
const { protect, authorize } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { createLoanSchema, approvalSchema } = require('./loan.validation');
const ctrl = require('./loan.controller');

const router = express.Router();

router.use(protect); // all routes require authentication

router.post('/', validate(createLoanSchema), ctrl.requestLoan);
router.get('/my', ctrl.getUserLoans);
router.get('/all', authorize('SUPER_ADMIN', 'ADMIN_JURUSAN'), ctrl.getAllLoans);
router.put('/:id/approve', authorize('SUPER_ADMIN', 'ADMIN_JURUSAN'), validate(approvalSchema), ctrl.approveLoan);
router.put('/:id/return', ctrl.returnLoan);

module.exports = router;