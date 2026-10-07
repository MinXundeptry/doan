const reportService = require('../services/report.service');

exports.getWeekly = async (req, res, next) => {
  try {
    const report = await reportService.getWeekly(req.user.id, req.query.end_date);
    return res.status(200).json({ status: 'success', data: report });
  } catch (error) {
    return next(error);
  }
};
