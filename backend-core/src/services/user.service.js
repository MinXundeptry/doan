const userRepository = require('../repositories/user.repository');
const { calculateBMR, calculateTDEE } = require('../utils/nutritionCalc');

class UserService {
  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('Không tìm thấy thông tin người dùng!');
    }
    return user;
  }

  async updateProfile(userId, data) {
    const { full_name, age, gender, height_cm, weight_kg, activity_level } = data;

    // Tính lại BMR và TDEE với chỉ số mới
    const bmr = calculateBMR(gender, weight_kg, height_cm, age);
    const tdee = calculateTDEE(bmr, activity_level);

    await userRepository.updateProfile(userId, {
      full_name,
      age,
      gender,
      height_cm,
      weight_kg,
      activity_level,
      bmr,
      tdee
    });

    return this.getProfile(userId);
  }
}

module.exports = new UserService();