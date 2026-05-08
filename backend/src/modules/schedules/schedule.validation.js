const { z } = require('zod');
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const createScheduleSchema = z.object({
  title: z.string().optional(),
  labId: z.string().uuid(),
  date: z.coerce.date(),
  startTime: z.string().regex(timeRegex, 'Invalid time format (HH:mm)'),
  endTime: z.string().regex(timeRegex, 'Invalid time format (HH:mm)'),
});

module.exports = { createScheduleSchema, updateScheduleSchema: createScheduleSchema.partial() };