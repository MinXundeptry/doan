const adminRepository = require('../repositories/admin.repository');
const rbacRepository = require('../repositories/rbac.repository');

const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

class AdminService {
  async listUsers({ page, limit, search, role_id: roleId }) {
    const filters = { search, roleId };
    const [items, total] = await Promise.all([
      adminRepository.listUsers({
        ...filters,
        limit,
        offset: (page - 1) * limit
      }),
      adminRepository.countUsers(filters)
    ]);
    return {
      items,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    };
  }

  async getUser(id) {
    const user = await adminRepository.findUserById(id);
    if (!user) throw createError(404, 'Không tìm thấy người dùng.');
    return user;
  }

  async assignUserRole(userId, roleSlug) {
    const role = await rbacRepository.findRoleBySlug(roleSlug);
    if (!role) throw createError(404, 'Không tìm thấy role.');
    const updated = await adminRepository.assignUserRole(userId, role.slug);
    if (!updated) throw createError(404, 'Không tìm thấy người dùng.');
    return this.getUser(userId);
  }

  async setUserActiveStatus(userId, isActive) {
    const updated = await adminRepository.setUserActiveStatus(userId, isActive);
    if (!updated) throw createError(404, 'Không tìm thấy người dùng.');
    return { ...(await this.getUser(userId)), is_active: isActive ? 1 : 0 };
  }

  getSystemReport() {
    return adminRepository.getSystemReport();
  }
}

module.exports = new AdminService();
