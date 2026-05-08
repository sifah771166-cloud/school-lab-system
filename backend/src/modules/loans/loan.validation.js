const { z } = require('zod');

const createLoanSchema = z.object({
  itemId: z.string().uuid(),
  quantity: z.number().int().positive(),
  requestNote: z.string().optional(),
  dueDate: z.coerce.date().optional(),
});

const approvalSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  rejectionReason: z.string().optional(),
});

module.exports = { createLoanSchema, approvalSchema };