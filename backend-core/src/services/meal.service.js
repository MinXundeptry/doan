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

  return {
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
  };
};

/**
 * Lấy danh sách món ăn và tính tổng Calo, Macro (Protein, Carb, Fat) theo ngày
 */
exports.getMealsByDate = async (userId, date) => {
  const queryDate = date || new Date().toISOString().split('T')[0];

  // Truy vấn tất cả món ăn trong ngày của user qua Repository
  const meals = await mealRepository.findByDate(userId, queryDate);

  // Cấu trúc dữ liệu trả về cho Client
  const dailySummary = {
    date: queryDate,
    totals: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    },
    meals_by_type: {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: []
    }
  };

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
  }

  return { message: 'Đã xóa món ăn khỏi nhật ký thành công!' };
};