const { z } = require('zod');

const createLabSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  capacity: z.number().int().positive().default(0),
  departmentId: z.string().uuid(),
});

module.exports = { createLabSchema, updateLabSchema: createLabSchema.partial() };