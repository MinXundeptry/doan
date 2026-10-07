const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/admin.controller');
const { verifyToken } = require('../../middlewares/auth.middleware');
const { requirePermission } = require('../../middlewares/role.middleware');
const validate = require('../../middlewares/validate.middleware');
const dto = require('../../dtos/admin.dto');

router.use(verifyToken);

router.get(
  '/users',
  requirePermission('users:read'),
  validate(dto.listUsersQuery, 'query'),
  adminController.listUsers
);
router.get(
  '/users/:id',
  requirePermission('users:read'),
  validate(dto.idParams, 'params'),
  adminController.getUser
);
router.patch(
  '/users/:id/role',
  requirePermission('users:assign-role'),
  validate(dto.idParams, 'params'),
  validate(dto.assignRoleBody),
  adminController.updateUserRole
);

router.get('/roles', requirePermission('roles:read'), adminController.listRoles);
router.get(
  '/roles/:id',
  requirePermission('roles:read'),
  validate(dto.idParams, 'params'),
  adminController.getRole
);

router.get(
  '/permissions',
  requirePermission('permissions:read'),
  adminController.listPermissions
);
router.get(
  '/permissions/:id',
  requirePermission('permissions:read'),
  validate(dto.idParams, 'params'),
  adminController.getPermission
);

module.exports = router;