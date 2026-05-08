const service = require('./attendance.service');

// Get all kunjungan (with optional search)
exports.getAll = async (req, res, next) => {
  try {
    const { search } = req.query;
    const kunjungan = await service.getAll(req.user, search);
    res.json({ data: kunjungan });
  } catch (err) { next(err); }
};

// Create kunjungan
exports.create = async (req, res, next) => {
  try {
    const kunjungan = await service.create(req.user.id, req.body);
    res.status(201).json({ success: true, data: kunjungan });
  } catch (err) { next(err); }
};

// Update kunjungan
exports.update = async (req, res, next) => {
  try {
    const kunjungan = await service.update(req.params.id, req.user, req.body);
    res.json({ success: true, data: kunjungan });
  } catch (err) { next(err); }
};

// Delete kunjungan (admin only)
exports.delete = async (req, res, next) => {
  try {
    await service.delete(req.params.id, req.user);
    res.json({ success: true, message: 'Kunjungan berhasil dihapus' });
  } catch (err) { next(err); }
};
