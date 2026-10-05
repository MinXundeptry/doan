<<<<<<< HEAD
const pool = require('../config/database');

class MealRepository {
  async findFoodById(foodId, connection = pool) {
    const [rows] = await connection.query(
      `SELECT id, name, calories, protein, carbs, fat
       FROM foods
       WHERE id = ?`,
      [foodId]
=======
const db = require('../config/database');

class MealRepository {
  // Lấy chỉ số TDEE từ profile người dùng
  async getUserTDEE(userId) {
    const [rows] = await db.query(
      'SELECT tdee FROM user_profiles WHERE user_id = ?',
      [userId]
>>>>>>> origin/main
    );
    return rows[0] || null;
  }

<<<<<<< HEAD
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
=======
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
>>>>>>> origin/main
        item.calories,
        item.protein,
        item.carbs,
        item.fat,
<<<<<<< HEAD
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
=======
        item.meal_id,
      ]);

      return true;
    }

    return false;
  }
}

module.exports = new MealRepository();
>>>>>>> origin/main
