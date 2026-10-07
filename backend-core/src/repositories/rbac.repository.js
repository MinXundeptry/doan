const pool = require('../config/database');
const {
  ROLE_DEFINITIONS,
  PERMISSION_DEFINITIONS,
  findRoleById
} = require('../constants/roles');

class RbacRepository {
  async userHasPermission(userId, permissionSlug) {
    const [rows] = await pool.query(
      'SELECT role FROM users WHERE id = ? LIMIT 1',
      [userId]
    );
    if (!rows[0]) return false;
    const role = ROLE_DEFINITIONS.find((definition) => definition.slug === rows[0].role);
    return Boolean(role && role.permissions.includes(permissionSlug));
  }

  async listRoles() {
    return ROLE_DEFINITIONS.map((role) => ({
      ...role,
      permissions: [...role.permissions]
    }));
  }

  async findRoleById(id) {
    const role = findRoleById(id);
    return role ? { ...role, permissions: [...role.permissions] } : null;
  }

  async findRoleBySlug(slug) {
    const role = ROLE_DEFINITIONS.find((definition) => definition.slug === slug);
    return role ? { ...role, permissions: [...role.permissions] } : null;
  }

  async listPermissions() {
    return PERMISSION_DEFINITIONS;
  }

  async findPermissionById(id) {
    return PERMISSION_DEFINITIONS.find((permission) => permission.id === Number(id)) || null;
  }
}

module.exports = new RbacRepository();
