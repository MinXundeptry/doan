const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');
const { calculateBMR, calculateTDEE } = require('../utils/nutritionCalc');

class AuthService {
  async register(data) {
    const { email, password, full_name, age, gender, height_cm, weight_kg, activity_level, role } = data;

    // 1. Kiểm tra email tồn tại
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('Email này đã được sử dụng!');
    }

    // 2. Hash mật khẩu
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Lưu bảng users
    const userId = await userRepository.createUser(email, passwordHash, role || 'user');

    // 4. Tính toán BMR và TDEE
    const bmr = calculateBMR(gender, weight_kg, height_cm, age);
    const tdee = calculateTDEE(bmr, activity_level);

    // 5. Lưu bảng user_profiles
    await userRepository.createProfile({
      user_id: userId,
      full_name: full_name || 'Người dùng',
      age,
      gender,
      height_cm,
      weight_kg,
      activity_level: activity_level || 'sedentary',
      bmr,
      tdee
    });

    return { userId, email };
  }

  async login(email, password) {
    // 1. Kiểm tra tài khoản
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Email hoặc mật khẩu không chính xác!');
    }

    // 2. So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new Error('Email hoặc mật khẩu không chính xác!');
    }

    // 3. Tạo JWT Token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    };
  }
}

module.exports = new AuthService();