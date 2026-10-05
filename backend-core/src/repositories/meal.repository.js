const pool = require('../config/database');

class MealRepository {
  async findFoodById(foodId, connection = pool) {
    const [rows] = await connection.query(
      `SELECT id, name, calories, protein, carbs, fat
       FROM foods
       WHERE id = ?`,
      [foodId]
    );
    return rows[0] || null;
  }

  async createMeal(userId, mealType, mealDate, connection = pool) {
    const [result] = await connection.query(
      `INSERT INTO meals (user_id, meal_type, meal_date)
       VALUES (?, ?, ?)`,
      [userId, mealType, mealDate]
    );
    return result.insertId;
  }

  async addMealDetail(mealId, item, connection = pool) {
    const [result] = await connection.query(
      `INSERT INTO meal_details
         (meal_id, food_name, amount_gram, calories, protein, carbs, fat)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        mealId,
        item.foodName,
        item.amountGram,
        item.calories,
        item.protein,
        item.carbs,
        item.fat
      ]
    );
    return result.insertId;
  }

  async updateMealTotals(mealId, connection = pool) {
    await connection.query(
      `UPDATE meals
       SET total_calories = COALESCE(
             (SELECT SUM(calories) FROM meal_details WHERE meal_id = ?), 0
           ),
           total_protein = COALESCE(
             (SELECT SUM(protein) FROM meal_details WHERE meal_id = ?), 0
           ),
           total_carbs = COALESCE(
             (SELECT SUM(carbs) FROM meal_details WHERE meal_id = ?), 0
           ),
           total_fat = COALESCE(
             (SELECT SUM(fat) FROM meal_details WHERE meal_id = ?), 0
           )
       WHERE id = ?`,
      [mealId, mealId, mealId, mealId, mealId]
    );
  }

  async getMealsByDate(userId, date) {
    const [rows] = await pool.query(
      `SELECT
         m.id AS meal_id,
         m.meal_type,
         m.meal_date,
         m.total_calories,
         m.total_protein,
         m.total_carbs,
         m.total_fat,
         d.id AS detail_id,
         d.food_name,
         d.amount_gram,
         d.calories,
         d.protein,
         d.carbs,
         d.fat,
         d.image_url
       FROM meals m
       LEFT JOIN meal_details d ON d.meal_id = m.id
       WHERE m.user_id = ? AND m.meal_date = ?
       ORDER BY m.id ASC, d.id ASC`,
      [userId, date]
    );
    return rows;
  }

  async findMealDetail(detailId, userId, connection = pool) {
    const [rows] = await connection.query(
      `SELECT d.*, m.user_id
       FROM meal_details d
       JOIN meals m ON m.id = d.meal_id
       WHERE d.id = ? AND m.user_id = ?`,
      [detailId, userId]
    );
    return rows[0] || null;
  }

  async updateMealDetail(detailId, item, connection = pool) {
    await connection.query(
      `UPDATE meal_details
       SET amount_gram = ?, calories = ?, protein = ?, carbs = ?, fat = ?
       WHERE id = ?`,
      [
        item.amountGram,
        item.calories,
        item.protein,
        item.carbs,
        item.fat,
        detailId
      ]
    );
  }

  async deleteMealDetail(detailId, connection = pool) {
    await connection.query(
      'DELETE FROM meal_details WHERE id = ?',
      [detailId]
    );
  }

  async deleteMeal(mealId, userId, connection = pool) {
    const [result] = await connection.query(
      'DELETE FROM meals WHERE id = ? AND user_id = ?',
      [mealId, userId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new MealRepository();
