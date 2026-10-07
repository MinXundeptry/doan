const pool = require('../config/database');

class ActivityRepository {
  async getWeight(userId) {
    const [rows] = await pool.query(
      'SELECT weight_kg FROM user_profiles WHERE user_id = ? LIMIT 1',
      [userId]
    );
    return rows[0] ? Number(rows[0].weight_kg) : null;
  }

  async create(userId, activity) {
    const [result] = await pool.query(
      `INSERT INTO activity_logs
         (user_id, activity_type, duration_minutes, met_value, weight_kg,
          calories_burned, activity_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        activity.activityType,
        activity.durationMinutes,
        activity.metValue,
        activity.weightKg,
        activity.caloriesBurned,
        activity.date
      ]
    );
    return result.insertId;
  }

  async getByDate(userId, date) {
    const [rows] = await pool.query(
      `SELECT id, activity_type, duration_minutes, met_value, weight_kg,
              calories_burned, activity_date, created_at
       FROM activity_logs
       WHERE user_id = ? AND activity_date = ?
       ORDER BY id DESC`,
      [userId, date]
    );
    return rows;
  }

  async delete(userId, activityId) {
    const [result] = await pool.query(
      'DELETE FROM activity_logs WHERE id = ? AND user_id = ?',
      [activityId, userId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new ActivityRepository();
