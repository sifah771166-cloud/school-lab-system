const { z } = require('zod');

const createKunjunganSchema = z.object({
  teacherName: z.string().min(1, 'Nama guru harus diisi'),
  classTeaching: z.string().min(1, 'Kelas yang diajar harus diisi'),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format jam mulai harus HH:MM'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format jam selesai harus HH:MM'),
  date: z.string().optional(),
});

const updateKunjunganSchema = z.object({
  teacherName: z.string().min(1),
  classTeaching: z.string().min(1),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  date: z.string().optional(),
});

module.exports = { createKunjunganSchema, updateKunjunganSchema };