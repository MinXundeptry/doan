const pool = require('../config/database');

class UserRepository {
  // Tìm người dùng theo Email
  async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  // Tìm người dùng theo ID
  async findById(id) {
    const [rows] = await pool.query(
      `SELECT u.id, u.email, u.role, p.full_name, p.age, p.gender, 
              p.height_cm, p.weight_kg, p.activity_level, p.bmr, p.tdee 
       FROM users u 
       LEFT JOIN user_profiles p ON u.id = p.user_id 
       WHERE u.id = ?`,
      [id]
    );
    return rows[0];
  }

  // Tạo tài khoản mới
  async createUser(email, passwordHash, role = 'user') {
    const [result] = await pool.query(
      'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
      [email, passwordHash, role]
    );
    return result.insertId;
  }

  // Tạo hồ sơ thể trạng người dùng
  async createProfile(profileData) {
    const { user_id, full_name, age, gender, height_cm, weight_kg, activity_level, bmr, tdee } = profileData;
    await pool.query(
      `INSERT INTO user_profiles 
       (user_id, full_name, age, gender, height_cm, weight_kg, activity_level, bmr, tdee) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, full_name, age, gender, height_cm, weight_kg, activity_level, bmr, tdee]
    );
  }

  // Cập nhật hồ sơ thể trạng
  async updateProfile(userId, profileData) {
    const { full_name, age, gender, height_cm, weight_kg, activity_level, bmr, tdee } = profileData;
    await pool.query(
      `UPDATE user_profiles 
       SET full_name = ?, age = ?, gender = ?, height_cm = ?, weight_kg = ?, activity_level = ?, bmr = ?, tdee = ?
       WHERE user_id = ?`,
      [full_name, age, gender, height_cm, weight_kg, activity_level, bmr, tdee, userId]
    );
  }
}

module.exports = new UserRepository();