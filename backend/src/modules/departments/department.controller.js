const service = require('./department.service');

exports.getAll = async (req, res, next) => {
  try {
    const departments = await service.getAll(req.user.role, req.user.departmentId);
    res.json({ data: departments });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const dept = await service.getById(req.params.id, req.user);
    res.json(dept);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const dept = await service.create(req.body);
    res.status(201).json(dept);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const dept = await service.update(req.params.id, req.body, req.user);
    res.json(dept);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await service.remove(req.params.id, req.user);
    res.status(204).end();
  } catch (err) { next(err); }
};