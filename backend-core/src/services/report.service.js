const reportRepository = require('../repositories/report.repository');

const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const parseDate = (value) => {
  const date = value || new Date().toISOString().slice(0, 10);
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw createError(400, 'Ngày phải đúng định dạng YYYY-MM-DD.');
  }
  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw createError(400, 'Ngày không hợp lệ.');
  }
  if (date > new Date().toISOString().slice(0, 10)) {
    throw createError(400, 'Ngày kết thúc báo cáo không thể ở tương lai.');
  }
  return parsed;
};

const toDateString = (date) => date.toISOString().slice(0, 10);

class ReportService {
  async getWeekly(userId, requestedEndDate) {
    const endDate = parseDate(requestedEndDate);
    const startDate = new Date(endDate);
    startDate.setUTCDate(startDate.getUTCDate() - 6);
    const endDateString = toDateString(endDate);
    const startDateString = toDateString(startDate);
    const { mealRows, activityRows } = await reportRepository.getDailyNutrition(
      userId,
      startDateString,
      endDateString
    );
    const mealsByDate = new Map(mealRows.map((row) => [row.date, row]));
    const activitiesByDate = new Map(activityRows.map((row) => [row.date, row]));
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(startDate);
      date.setUTCDate(date.getUTCDate() + index);
      const key = toDateString(date);
      const meal = mealsByDate.get(key);
      const activity = activitiesByDate.get(key);
      return {
        date: key,
        meal_count: Number(meal?.meal_count || 0),
        calories_consumed: Number(meal?.calories || 0),
        protein: Number(meal?.protein || 0),
        carbs: Number(meal?.carbs || 0),
        fat: Number(meal?.fat || 0),
        activity_count: Number(activity?.activity_count || 0),
        calories_burned: Number(activity?.calories_burned || 0)
      };
    });

    return {
      start_date: startDateString,
      end_date: endDateString,
      totals: days.reduce((totals, day) => ({
        meal_count: totals.meal_count + day.meal_count,
        calories_consumed: totals.calories_consumed + day.calories_consumed,
        protein: totals.protein + day.protein,
        carbs: totals.carbs + day.carbs,
        fat: totals.fat + day.fat,
        activity_count: totals.activity_count + day.activity_count,
        calories_burned: totals.calories_burned + day.calories_burned
      }), {
        meal_count: 0,
        calories_consumed: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        activity_count: 0,
        calories_burned: 0
      }),
      days
    };
  }
}

module.exports = new ReportService();
