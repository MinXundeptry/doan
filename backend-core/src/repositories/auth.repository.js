const db = require('../config/database');
const { DEFAULT_ROLE } = require('../constants/roles');

class UserRepository {
  // Tìm người dùng theo Email
  async findByEmail(email) {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  }

  // Tìm người dùng theo ID
  async findById(id) {
    const [rows] = await db.query(
      'SELECT id, email, role, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  // Tạo tài khoản mới trong bảng users
  async createUser(email, passwordHash, role = DEFAULT_ROLE) {
    const query = `
      INSERT INTO users (email, password_hash, role)
      VALUES (?, ?, ?)
    `;
    const [result] = await db.query(query, [email, passwordHash, role]);
    return result.insertId;
  }

  // Tạo hồ sơ thể trạng trong bảng user_profiles
  async createProfile(profileData) {
    const {
      user_id,
      full_name,
      age,
      gender,
      height_cm,
      weight_kg,
      activity_level,
      bmr,
      tdee
    } = profileData;

    const query = `
      INSERT INTO user_profiles (user_id, full_name, age, gender, height_cm, weight_kg, activity_level, bmr, tdee)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(query, [
      user_id,
      full_name,
      age,
      gender,
      height_cm,
      weight_kg,
      activity_level,
      bmr,
      tdee
    ]);

    return result.insertId;
  }
}

module.exports = new UserRepository();