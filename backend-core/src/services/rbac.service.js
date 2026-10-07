const rbacRepository = require('../repositories/rbac.repository');

const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

class RbacService {
  async listRoles() {
    return rbacRepository.listRoles();
  }

  async getRole(id) {
    const role = await rbacRepository.findRoleById(id);
    if (!role) throw createError(404, 'Không tìm thấy role.');
    return role;
  }

  async listPermissions() {
    return rbacRepository.listPermissions();
  }

  async getPermission(id) {
    const permission = await rbacRepository.findPermissionById(id);
    if (!permission) throw createError(404, 'Không tìm thấy permission.');
    return permission;
  }
}

module.exports = new RbacService();
