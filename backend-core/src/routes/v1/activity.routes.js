const express = require('express');
const router = express.Router();
const controller = require('../../controllers/activity.controller');
const { verifyToken } = require('../../middlewares/auth.middleware');
const { requirePermission } = require('../../middlewares/role.middleware');
const validate = require('../../middlewares/validate.middleware');
const dto = require('../../dtos/activity.dto');

router.use(verifyToken);

router.post(
  '/',
  requirePermission('activities:create'),
  validate(dto.createActivity),
  controller.create
);
router.get(
  '/daily',
  requirePermission('activities:read'),
  validate(dto.dailyQuery, 'query'),
  controller.getDaily
);
router.delete(
  '/:id',
  requirePermission('activities:delete'),
  validate(dto.idParams, 'params'),
  controller.remove
);

module.exports = router;
