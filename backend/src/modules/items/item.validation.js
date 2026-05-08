const { z } = require('zod');

const createItemSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  category: z.string().optional(),
  quantity: z.number().int().nonnegative().default(1),
  condition: z.enum(['good', 'damaged', 'missing']).default('good'),
  labId: z.string().uuid(),
});

module.exports = { createItemSchema, updateItemSchema: createItemSchema.partial() };