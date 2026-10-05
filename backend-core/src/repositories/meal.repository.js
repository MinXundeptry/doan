const db = require('../config/database');

class MealRepository {
  // Lấy chỉ số TDEE từ profile người dùng
  async getUserTDEE(userId) {
    const [rows] = await db.query(
      'SELECT tdee FROM user_profiles WHERE user_id = ?',
      [userId]
    );
    return rows[0] || null;
  }

  // Lấy tổng calo tiêu thụ trong ngày
  async getTotalCaloriesByDate(userId, queryDate) {
    const [rows] = await db.query(
      'SELECT SUM(total_calories) AS total_calories FROM meals WHERE user_id = ? AND meal_date = ?',
      [userId, queryDate]
    );
    return rows[0]?.total_calories || 0;
  }

  // Thêm bữa ăn mới vào CSDL (Khớp với bảng meals + meal_details)
  async create(mealData) {
    const {
      user_id,
      meal_type,
      food_name,
      calories,
      protein,
      carbs,
      fat,
      serving_size,
      logged_date,
    } = mealData;

    // 1. Kiểm tra xem user đã có record meal cho loại bữa ăn (meal_type) trong ngày (meal_date) chưa
    const [existingMeals] = await db.query(
      'SELECT id, total_calories, total_protein, total_carbs, total_fat FROM meals WHERE user_id = ? AND meal_type = ? AND meal_date = ?',
      [user_id, meal_type, logged_date]
    );

    let mealId;

    if (existingMeals.length > 0) {
      // Đã có bữa ăn -> Cập nhật cộng dồn tổng chỉ số dinh dưỡng
      mealId = existingMeals[0].id;
      const updateQuery = `
        UPDATE meals 
        SET total_calories = total_calories + ?, 
            total_protein = total_protein + ?, 
            total_carbs = total_carbs + ?, 
            total_fat = total_fat + ?
        WHERE id = ?
      `;
      await db.query(updateQuery, [calories, protein, carbs, fat, mealId]);
    } else {
      // Chưa có bữa ăn -> Tạo mới một record trong bảng meals
      const insertMealQuery = `
        INSERT INTO meals (user_id, meal_type, meal_date, total_calories, total_protein, total_carbs, total_fat)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const [mealResult] = await db.query(insertMealQuery, [
        user_id,
        meal_type,
        logged_date,
        calories,
        protein,
        carbs,
        fat,
      ]);
      mealId = mealResult.insertId;
    }

    // 2. Chèn món ăn chi tiết vào bảng meal_details
    const insertDetailQuery = `
      INSERT INTO meal_details (meal_id, food_name, amount_gram, calories, protein, carbs, fat)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    // Quy đổi serving_size sang gram (mặc định khẩu phần 1 = 100g)
    const amountGram = (serving_size || 1) * 100;

    const [detailResult] = await db.query(insertDetailQuery, [
      mealId,
      food_name,
      amountGram,
      calories,
      protein,
      carbs,
      fat,
    ]);

    return detailResult.insertId;
  }

  // Lấy tất cả món ăn trong ngày của user (JOIN bảng meals và meal_details)
  async findByDate(userId, queryDate) {
    const query = `
      SELECT 
        md.id,
        m.meal_type,
        md.food_name,
        md.calories,
        md.protein,
        md.carbs,
        md.fat,
        (md.amount_gram / 100) AS serving_size,
        m.meal_date AS logged_date,
        m.created_at
      FROM meals m
      JOIN meal_details md ON m.id = md.meal_id
      WHERE m.user_id = ? AND m.meal_date = ?
      ORDER BY m.created_at ASC, md.id ASC
    `;

    const [rows] = await db.query(query, [userId, queryDate]);
    return rows;
  }

  // Lấy chi tiết 1 món ăn theo ID (trong meal_details) và User ID
  async findByIdAndUser(mealDetailId, userId) {
    const query = `
      SELECT md.*, m.user_id, m.meal_type, m.meal_date
      FROM meal_details md
      JOIN meals m ON md.meal_id = m.id
      WHERE md.id = ? AND m.user_id = ?
    `;

    const [rows] = await db.query(query, [mealDetailId, userId]);
    return rows[0] || null;
  }

  // Xóa 1 món ăn chi tiết và cập nhật lại tổng Calo/Macro của bữa ăn
  async delete(mealDetailId, userId) {
    // 1. Kiểm tra món ăn có tồn tại và thuộc về user không
    const item = await this.findByIdAndUser(mealDetailId, userId);
    if (!item) return false;

    // 2. Xóa món ăn khỏi meal_details
    const [result] = await db.query('DELETE FROM meal_details WHERE id = ?', [
      mealDetailId,
    ]);

    if (result.affectedRows > 0) {
      // 3. Trừ bớt chỉ số khỏi bảng meals
      const updateMealQuery = `
        UPDATE meals 
        SET total_calories = GREATEST(0, total_calories - ?), 
            total_protein = GREATEST(0, total_protein - ?), 
            total_carbs = GREATEST(0, total_carbs - ?), 
            total_fat = GREATEST(0, total_fat - ?)
        WHERE id = ?
      `;
      await db.query(updateMealQuery, [
        item.calories,
        item.protein,
        item.carbs,
        item.fat,
        item.meal_id,
      ]);

      return true;
    }

    return false;
  }
}

module.exports = new MealRepository();