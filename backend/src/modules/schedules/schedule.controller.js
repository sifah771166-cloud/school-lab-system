const service = require('./schedule.service');

exports.getAll = async (req, res, next) => {
  try {
    const schedules = await service.getAll(req.user);
    res.json({ data: schedules });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const schedule = await service.getById(req.params.id, req.user);
    res.json(schedule);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const schedule = await service.create(req.body, req.user);
    res.status(201).json(schedule);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const schedule = await service.update(req.params.id, req.body, req.user);
    res.json(schedule);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await service.remove(req.params.id, req.user);
    res.status(204).end();
  } catch (err) { next(err); }
};
