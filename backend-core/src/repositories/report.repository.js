const pool = require('../config/database');

class ReportRepository {
  async getDailyNutrition(userId, startDate, endDate) {
    const [mealRows] = await pool.query(
      `SELECT DATE_FORMAT(meal_date, '%Y-%m-%d') AS date,
              COUNT(*) AS meal_count,
              COALESCE(SUM(total_calories), 0) AS calories,
              COALESCE(SUM(total_protein), 0) AS protein,
              COALESCE(SUM(total_carbs), 0) AS carbs,
              COALESCE(SUM(total_fat), 0) AS fat
       FROM meals
       WHERE user_id = ? AND meal_date BETWEEN ? AND ?
       GROUP BY meal_date
       ORDER BY meal_date`,
      [userId, startDate, endDate]
    );
    const [activityRows] = await pool.query(
      `SELECT DATE_FORMAT(activity_date, '%Y-%m-%d') AS date,
              COUNT(*) AS activity_count,
              COALESCE(SUM(calories_burned), 0) AS calories_burned
       FROM activity_logs
       WHERE user_id = ? AND activity_date BETWEEN ? AND ?
       GROUP BY activity_date
       ORDER BY activity_date`,
      [userId, startDate, endDate]
    );
    return { mealRows, activityRows };
  }
}

module.exports = new ReportRepository();
