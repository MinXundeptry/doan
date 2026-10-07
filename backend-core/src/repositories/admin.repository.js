const pool = require('../config/database');
const {
  ROLES,
  findRoleById,
  findRoleBySlug
} = require('../constants/roles');

class AdminRepository {
  async listUsers({ search, roleId, limit, offset }) {
    let conditions = '1 = 1';
    const parameters = [];
    if (search) {
      conditions += ' AND (u.email LIKE ? OR p.full_name LIKE ?)';
      parameters.push(`%${search}%`, `%${search}%`);
    }
    if (roleId) {
      const role = findRoleById(roleId);
      if (!role) return [];
      conditions += ' AND u.role = ?';
      parameters.push(role.slug);
    }

    const [rows] = await pool.query(
      `SELECT u.id, u.email, u.created_at, u.updated_at,
              u.role,
              p.full_name, p.age, p.gender
       FROM users u
       LEFT JOIN user_profiles p ON p.user_id = u.id
       WHERE ${conditions}
       ORDER BY u.id DESC
       LIMIT ? OFFSET ?`,
      [...parameters, limit, offset]
    );
    return rows.map((row) => this.addRoleDetails(row));
  }

  async countUsers({ search, roleId }) {
    let conditions = '1 = 1';
    const parameters = [];
    if (search) {
      conditions += ' AND (u.email LIKE ? OR p.full_name LIKE ?)';
      parameters.push(`%${search}%`, `%${search}%`);
    }
    if (roleId) {
      const role = findRoleById(roleId);
      if (!role) return 0;
      conditions += ' AND u.role = ?';
      parameters.push(role.slug);
    }
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM users u
       LEFT JOIN user_profiles p ON p.user_id = u.id
       WHERE ${conditions}`,
      parameters
    );
    return Number(rows[0].total);
  }

  async findUserById(id) {
    const [rows] = await pool.query(
      `SELECT u.id, u.email, u.role, u.created_at, u.updated_at,
              p.full_name, p.age, p.gender, p.height_cm, p.weight_kg,
              p.activity_level, p.bmr, p.tdee
       FROM users u
       LEFT JOIN user_profiles p ON p.user_id = u.id
       WHERE u.id = ?`,
      [id]
    );
    return rows[0] ? this.addRoleDetails(rows[0]) : null;
  }

  addRoleDetails(user) {
    const role = findRoleBySlug(user.role);
    return {
      ...user,
      role_id: role ? role.id : null,
      role_name: role ? role.name : user.role
    };
  }

  async assignUserRole(userId, roleSlug) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [adminUsers] = await connection.query(
        'SELECT id FROM users WHERE role = ? ORDER BY id FOR UPDATE',
        [ROLES.ADMIN]
      );
      const [users] = await connection.query(
        'SELECT id, role FROM users WHERE id = ? FOR UPDATE',
        [userId]
      );
      if (users.length === 0) {
        await connection.rollback();
        return false;
      }

      if (
        users[0].role === ROLES.ADMIN &&
        roleSlug !== ROLES.ADMIN &&
        adminUsers.length <= 1
      ) {
        const error = new Error('Không thể hạ quyền của quản trị viên cuối cùng.');
        error.statusCode = 409;
        throw error;
      }

      await connection.query(
        'UPDATE users SET role = ? WHERE id = ?',
        [roleSlug, userId]
      );
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

}

module.exports = new AdminRepository();
