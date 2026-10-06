const db = require('../config/database');

class AiRepository {
  async getProfileByUserId(userId) {
    const [rows] = await db.query(
      `SELECT age, gender, height_cm, weight_kg, activity_level, bmr, tdee
       FROM user_profiles WHERE user_id = ?`,
      [userId]
    );
    return rows[0] || null;
  }
}

module.exports = new AiRepository();