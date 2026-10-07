const userRepository = require('../repositories/user.repository');
const { calculateBMR, calculateTDEE, calculateTargetCalories } = require('../utils/nutritionCalc');

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
    const existingProfile = await this.getProfile(userId);
    const goal = data.goal || existingProfile.goal || 'maintain';
    if (!['lose', 'maintain', 'gain'].includes(goal)) {
      const error = new Error('Mục tiêu dinh dưỡng không hợp lệ.');
      error.statusCode = 400;
      throw error;
    }

    // Tính lại BMR và TDEE với chỉ số mới
    const bmr = calculateBMR(gender, weight_kg, height_cm, age);
    const tdee = calculateTDEE(bmr, activity_level);
    const target_calories = calculateTargetCalories(tdee, goal, gender);

    await userRepository.updateProfile(userId, {
      full_name,
      age,
      gender,
      height_cm,
      weight_kg,
      activity_level,
      bmr,
      tdee,
      goal,
      target_calories
    });

    return this.getProfile(userId);
  }
}

module.exports = new UserService();