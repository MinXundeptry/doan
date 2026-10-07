const adminService = require('../services/admin.service');
const rbacService = require('../services/rbac.service');
const { findRoleById } = require('../constants/roles');

const handle = (action, statusCode = 200) => async (req, res, next) => {
  try {
    const result = await action(req);
    return res.status(statusCode).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    return next(error);
  }
};

const assignUserRole = handle((req) => {
  if (Number(req.params.id) === Number(req.user.id)) {
    const error = new Error('Không thể tự thay đổi quyền của chính mình.');
    error.statusCode = 400;
    throw error;
  }

  const roleSlug =
    req.body.role || findRoleById(req.body.role_id)?.slug;
  return adminService.assignUserRole(req.params.id, roleSlug);
});

const adminController = {
  listUsers: handle((req) => adminService.listUsers(req.query)),
  getUser: handle((req) => adminService.getUser(req.params.id)),
  assignUserRole,
  updateUserRole: assignUserRole,
  listRoles: handle(() => rbacService.listRoles()),
  getRole: handle((req) => rbacService.getRole(req.params.id)),
  listPermissions: handle(() => rbacService.listPermissions()),
  getPermission: handle((req) => rbacService.getPermission(req.params.id))
};

module.exports = adminController;