const service = require('./lab.service');

exports.getAll = async (req, res, next) => {
  try {
    const labs = await service.getAll(req.user);
    res.json({ data: labs });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const lab = await service.getById(req.params.id, req.user);
    res.json(lab);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const lab = await service.create(req.body, req.user);
    res.status(201).json(lab);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const lab = await service.update(req.params.id, req.body, req.user);
    res.json(lab);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await service.remove(req.params.id, req.user);
    res.status(204).end();
  } catch (err) { next(err); }
};
