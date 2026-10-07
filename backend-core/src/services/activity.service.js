const activityRepository = require('../repositories/activity.repository');

const ACTIVITY_TYPES = Object.freeze({
  walking: { label: 'Đi bộ', met: 3.5 },
  running: { label: 'Chạy bộ', met: 8.3 },
  cycling: { label: 'Đạp xe', met: 6.8 },
  swimming: { label: 'Bơi lội', met: 6.0 },
  strength_training: { label: 'Tập thể lực', met: 5.0 },
  yoga: { label: 'Yoga', met: 2.5 }
});

const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validateDate = (date) => {
  const value = date || new Date().toISOString().slice(0, 10);
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw createError(400, 'Ngày phải đúng định dạng YYYY-MM-DD.');
  }
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw createError(400, 'Ngày phải đúng định dạng YYYY-MM-DD.');
  }
  if (value > new Date().toISOString().slice(0, 10)) {
    throw createError(400, 'Không thể ghi hoạt động cho ngày trong tương lai.');
  }
  return value;
};

const serializeActivity = (activity) => ({
  id: activity.id,
  activity_type: activity.activity_type,
  duration_minutes: Number(activity.duration_minutes),
  met_value: Number(activity.met_value),
  weight_kg: Number(activity.weight_kg),
  calories_burned: Number(activity.calories_burned),
  activity_date: activity.activity_date,
  created_at: activity.created_at
});

class ActivityService {
  async create(userId, data) {
    const activityType = ACTIVITY_TYPES[data.activity_type];
    if (!activityType) throw createError(400, 'Loại vận động không hợp lệ.');
    const durationMinutes = Number(data.duration_minutes);
    if (!Number.isInteger(durationMinutes) || durationMinutes < 1 || durationMinutes > 1440) {
      throw createError(400, 'Thời lượng phải từ 1 đến 1440 phút.');
    }
    const date = validateDate(data.activity_date);
    const weightKg = await activityRepository.getWeight(userId);
    if (!Number.isFinite(weightKg) || weightKg <= 0) {
      throw createError(422, 'Hãy cập nhật cân nặng trong hồ sơ trước khi ghi vận động.');
    }

    const caloriesBurned = Math.round(
      activityType.met * 3.5 * weightKg / 200 * durationMinutes * 100
    ) / 100;
    const id = await activityRepository.create(userId, {
      activityType: data.activity_type,
      durationMinutes,
      metValue: activityType.met,
      weightKg,
      caloriesBurned,
      date
    });
    return {
      id,
      activity_type: data.activity_type,
      activity_name: activityType.label,
      duration_minutes: durationMinutes,
      met_value: activityType.met,
      weight_kg: weightKg,
      calories_burned: caloriesBurned,
      activity_date: date
    };
  }

  async getDaily(userId, requestedDate) {
    const date = validateDate(requestedDate);
    const rows = await activityRepository.getByDate(userId, date);
    const activities = rows.map(serializeActivity);
    return {
      date,
      total_calories_burned: Math.round(
        activities.reduce((sum, item) => sum + item.calories_burned, 0) * 100
      ) / 100,
      activities
    };
  }

  async delete(userId, activityId) {
    const deleted = await activityRepository.delete(userId, activityId);
    if (!deleted) throw createError(404, 'Không tìm thấy hoạt động trong nhật ký của bạn.');
    return { message: 'Đã xóa hoạt động khỏi nhật ký.' };
  }
}

module.exports = { service: new ActivityService(), ACTIVITY_TYPES };
