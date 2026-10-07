const { service } = require('../services/activity.service');

exports.create = async (req, res, next) => {
  try {
    const activity = await service.create(req.user.id, req.body);
    return res.status(201).json({
      status: 'success',
      message: 'Đã ghi nhận hoạt động.',
      data: activity
    });
  } catch (error) {
    return next(error);
  }
};

exports.getDaily = async (req, res, next) => {
  try {
    const result = await service.getDaily(req.user.id, req.query.date);
    return res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    return next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const result = await service.delete(req.user.id, req.params.id);
    return res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    return next(error);
  }
};
