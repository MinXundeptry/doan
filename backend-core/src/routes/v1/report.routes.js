const express = require('express');
const router = express.Router();
const controller = require('../../controllers/report.controller');
const { verifyToken } = require('../../middlewares/auth.middleware');
const { requirePermission } = require('../../middlewares/role.middleware');
const validate = require('../../middlewares/validate.middleware');
const dto = require('../../dtos/report.dto');

router.get(
  '/weekly',
  verifyToken,
  requirePermission('reports:read'),
  validate(dto.weeklyQuery, 'query'),
  controller.getWeekly
);

module.exports = router;
