<<<<<<< HEAD
const pool = require('../config/database');
const mealRepository = require('../repositories/meal.repository');

const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const round = (value) => Number(Number(value).toFixed(2));
=======
const mealRepository = require('../repositories/meal.repository');

/**
 * Tính phần trăm Calo đã nạp trong ngày so với TDEE của người dùng
 * @param {number} userId - ID người dùng
 * @param {string} date - Ngày cần kiểm tra (YYYY-MM-DD)
 */
exports.getCalorieProgress = async (userId, date) => {
  const queryDate = date || new Date().toISOString().split('T')[0];

  // 1. Lấy chỉ số TDEE từ profile người dùng thông qua Repository
  const userProfile = await mealRepository.getUserTDEE(userId);

  if (!userProfile) {
    throw new Error('Chưa tìm thấy hồ sơ thể trạng người dùng! Vui lòng cập nhật TDEE.');
  }

  const targetTDEE = Number(userProfile.tdee) || 2000; // Mặc định 2000 calo nếu chưa thiết lập

  // 2. Lấy tổng số Calo đã nạp trong ngày từ Repository
  const totalCalories = await mealRepository.getTotalCaloriesByDate(userId, queryDate);
  const consumedCalories = Number(totalCalories) || 0;

  // 3. Tính toán các chỉ số
  const percentage = Number(((consumedCalories / targetTDEE) * 100).toFixed(1));
  const remainingCalories = Number((targetTDEE - consumedCalories).toFixed(1));

  // 4. Phân loại trạng thái tiêu thụ
  let status = 'IN_PROGRESS'; // Đang trong quá trình nạp
  if (percentage >= 95 && percentage <= 105) {
    status = 'TARGET_MET';    // Đạt mục tiêu chuẩn (độ lệch ±5%)
  } else if (percentage > 105) {
    status = 'EXCEEDED';      // Đã vượt mức TDEE
  }

  return {
    date: queryDate,
    target_tdee: targetTDEE,
    consumed_calories: Number(consumedCalories.toFixed(1)),
    remaining_calories: remainingCalories,
    percentage: percentage,
    status: status
  };
};

/**
 * Ghi nhận một món ăn mới vào CSDL
 */
exports.createMeal = async (mealData) => {
  const {
    user_id,
    meal_type,
    food_name,
    calories,
    protein = 0,
    carbs = 0,
    fat = 0,
    serving_size = 1,
    date
  } = mealData;

  // Chuẩn hóa ngày (YYYY-MM-DD)
  const mealDate = date || new Date().toISOString().split('T')[0];

  const newMealId = await mealRepository.create({
    user_id,
    meal_type,
    food_name,
    calories,
    protein,
    carbs,
    fat,
    serving_size,
    logged_date: mealDate
  });
>>>>>>> origin/main

const calculateNutrition = (food, amountGram) => {
  const scale = amountGram / 100;
  return {
<<<<<<< HEAD
    foodName: food.name,
    amountGram,
    calories: round(Number(food.calories) * scale),
    protein: round(Number(food.protein) * scale),
    carbs: round(Number(food.carbs) * scale),
    fat: round(Number(food.fat) * scale)
=======
    id: newMealId,
    user_id,
    meal_type,
    food_name,
    calories,
    protein,
    carbs,
    fat,
    serving_size,
    logged_date: mealDate
>>>>>>> origin/main
  };
};

const validateDate = (date) => {
  if (date === undefined) {
    return new Date().toISOString().slice(0, 10);
  }

<<<<<<< HEAD
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw createError(400, 'Ngày phải đúng định dạng YYYY-MM-DD.');
  }
=======
  // Truy vấn tất cả món ăn trong ngày của user qua Repository
  const meals = await mealRepository.findByDate(userId, queryDate);
>>>>>>> origin/main

  const parsedDate = new Date(`${date}T00:00:00.000Z`);
  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== date
  ) {
    throw createError(400, 'Ngày phải đúng định dạng YYYY-MM-DD.');
  }

  return date;
};

const validateAmount = (amountGram) => {
  const amount = Number(amountGram);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 9999.99) {
    throw createError(400, 'amount_gram phải lớn hơn 0 và không quá 9999.99.');
  }
  return round(amount);
};

const validateMealType = (mealType) => {
  if (!mealTypes.includes(mealType)) {
    throw createError(400, 'meal_type không hợp lệ.');
  }
};

const recalculateMeal = async (mealId, connection) => {
  await mealRepository.updateMealTotals(mealId, connection);
};

class MealService {
  async logMeal(userId, data) {
    const { meal_type: mealType, meal_date: requestedDate, items } = data;
    validateMealType(mealType);
    const mealDate = validateDate(requestedDate);

    if (!Array.isArray(items) || items.length === 0) {
      throw createError(400, 'items phải có ít nhất một món ăn.');
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const mealId = await mealRepository.createMeal(
        userId,
        mealType,
        mealDate,
        connection
      );
      const savedItems = [];

      for (const item of items) {
        const foodId = Number(item.food_id);
        if (!Number.isInteger(foodId) || foodId <= 0) {
          throw createError(400, 'food_id phải là số nguyên dương.');
        }

        const food = await mealRepository.findFoodById(foodId, connection);
        if (!food) {
          throw createError(404, `Không tìm thấy thực phẩm có id ${foodId}.`);
        }

        const nutrition = calculateNutrition(
          food,
          validateAmount(item.amount_gram)
        );
        const detailId = await mealRepository.addMealDetail(
          mealId,
          nutrition,
          connection
        );
        savedItems.push({ id: detailId, ...nutrition });
      }

      await recalculateMeal(mealId, connection);
      await connection.commit();
      return {
        id: mealId,
        meal_type: mealType,
        meal_date: mealDate,
        items: savedItems
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async getDailySummary(userId, requestedDate) {
    const date = validateDate(requestedDate);
    const rows = await mealRepository.getMealsByDate(userId, date);
    const meals = new Map();
    const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };

    for (const row of rows) {
      let meal = meals.get(row.meal_id);
      if (!meal) {
        meal = {
          id: row.meal_id,
          meal_type: row.meal_type,
          meal_date: row.meal_date,
          totals: {
            calories: Number(row.total_calories) || 0,
            protein: Number(row.total_protein) || 0,
            carbs: Number(row.total_carbs) || 0,
            fat: Number(row.total_fat) || 0
          },
          items: []
        };
        meals.set(row.meal_id, meal);
      }

      if (row.detail_id !== null) {
        const item = {
          id: row.detail_id,
          food_name: row.food_name,
          amount_gram: Number(row.amount_gram),
          calories: Number(row.calories),
          protein: Number(row.protein),
          carbs: Number(row.carbs),
          fat: Number(row.fat),
          image_url: row.image_url
        };
        meal.items.push(item);
        totals.calories += item.calories;
        totals.protein += item.protein;
        totals.carbs += item.carbs;
        totals.fat += item.fat;
      }
    }

    const mealsByType = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: []
    };
    for (const meal of meals.values()) {
      mealsByType[meal.meal_type].push(meal);
    }

<<<<<<< HEAD
    return {
      date,
      totals: Object.fromEntries(
        Object.entries(totals).map(([key, value]) => [key, round(value)])
      ),
      meals: Array.from(meals.values()),
      meals_by_type: mealsByType
    };
=======
  // Gom nhóm bữa ăn và tính tổng chỉ số dinh dưỡng
  meals.forEach((meal) => {
    dailySummary.totals.calories += Number(meal.calories) || 0;
    dailySummary.totals.protein += Number(meal.protein) || 0;
    dailySummary.totals.carbs += Number(meal.carbs) || 0;
    dailySummary.totals.fat += Number(meal.fat) || 0;

    if (dailySummary.meals_by_type[meal.meal_type]) {
      dailySummary.meals_by_type[meal.meal_type].push(meal);
    } else {
      dailySummary.meals_by_type[meal.meal_type] = [meal];
    }
  });

  // Làm tròn 1 chữ số thập phân
  dailySummary.totals.calories = Number(dailySummary.totals.calories.toFixed(1));
  dailySummary.totals.protein = Number(dailySummary.totals.protein.toFixed(1));
  dailySummary.totals.carbs = Number(dailySummary.totals.carbs.toFixed(1));
  dailySummary.totals.fat = Number(dailySummary.totals.fat.toFixed(1));

  return dailySummary;
};

/**
 * Xóa món ăn khỏi nhật ký
 */
exports.deleteMeal = async (mealId, userId) => {
  const isDeleted = await mealRepository.delete(mealId, userId);

  if (!isDeleted) {
    throw new Error('Không tìm thấy món ăn hoặc bạn không có quyền xóa!');
>>>>>>> origin/main
  }

  async updateMealItemQuantity(userId, detailId, requestedAmount) {
    const amountGram = validateAmount(requestedAmount);
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const detail = await mealRepository.findMealDetail(
        detailId,
        userId,
        connection
      );
      if (!detail) {
        throw createError(404, 'Không tìm thấy món ăn trong nhật ký của bạn.');
      }

      const nutrition = calculateNutrition(
        {
          name: detail.food_name,
          calories: Number(detail.calories) / Number(detail.amount_gram) * 100,
          protein: Number(detail.protein) / Number(detail.amount_gram) * 100,
          carbs: Number(detail.carbs) / Number(detail.amount_gram) * 100,
          fat: Number(detail.fat) / Number(detail.amount_gram) * 100
        },
        amountGram
      );
      await mealRepository.updateMealDetail(detailId, nutrition, connection);
      await recalculateMeal(detail.meal_id, connection);
      await connection.commit();

      return { id: Number(detailId), ...nutrition };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async deleteMealItem(userId, detailId) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const detail = await mealRepository.findMealDetail(
        detailId,
        userId,
        connection
      );
      if (!detail) {
        throw createError(404, 'Không tìm thấy món ăn trong nhật ký của bạn.');
      }

      await mealRepository.deleteMealDetail(detailId, connection);
      await recalculateMeal(detail.meal_id, connection);
      await connection.commit();
      return { message: 'Đã xóa món ăn khỏi bữa ăn.' };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async deleteMeal(userId, mealId) {
    const deleted = await mealRepository.deleteMeal(mealId, userId);
    if (!deleted) {
      throw createError(404, 'Không tìm thấy bữa ăn trong nhật ký của bạn.');
    }
    return { message: 'Đã xóa bữa ăn.' };
  }
}

module.exports = new MealService();
