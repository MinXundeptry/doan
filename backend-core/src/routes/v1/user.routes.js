const express = require('express');
const router = express.Router();
const userController = require('../../controllers/user.controller');
const { verifyToken } = require('../../middlewares/auth.middleware');
const { requirePermission } = require('../../middlewares/role.middleware');

router.get(
  '/profile',
  verifyToken,
  requirePermission('profile:read'),
  userController.getProfile
);
router.put(
  '/profile',
  verifyToken,
  requirePermission('profile:update'),
  userController.updateProfile
);

module.exports = router;