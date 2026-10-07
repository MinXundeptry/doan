const axios = require('axios');
const FormData = require('form-data');
const mealRepository = require('../repositories/meal.repository');
const aiRepository = require('../repositories/ai.repository');

const aiClient = axios.create({
  baseURL: process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000/api/v1',
  timeout: 60000,
});

const VALID_MODES = ['advice', 'menu', 'analyze'];
const VALID_GOALS = ['lose', 'maintain', 'gain'];
const MAX_HISTORY = 10;

const httpError = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

// Đổi lỗi từ backend-ai / mạng thành lỗi dễ hiểu cho người dùng
function toAiError(err) {
  console.error('[ai-proxy]', err.response?.status || err.code, err.response?.data || err.message);
  if (err.response?.status === 400 && typeof err.response.data?.detail === 'string') {
    return httpError(err.response.data.detail, 400);
  }
  if (err.response?.status === 422) {
    return httpError('Dữ liệu gửi lên trợ lý AI không hợp lệ.', 400);
  }
  return httpError('Trợ lý AI đang bận hoặc chưa sẵn sàng, vui lòng thử lại sau.', 503);
}

const num = (v) => (v === null || v === undefined ? null : Number(v));

async function buildProfile(userId, extra) {
  const row = await aiRepository.getProfileByUserId(userId);
  if (!row) return null; // chưa có hồ sơ -> AI sẽ nhắc người dùng bổ sung
  return {
    age: num(row.age),
    gender: row.gender || null,
    height_cm: num(row.height_cm),
    weight_kg: num(row.weight_kg),
    activity_level: row.activity_level || null,
    bmr: num(row.bmr),
    tdee: num(row.tdee),
    goal: VALID_GOALS.includes(extra.goal) ? extra.goal : null,
    target_calories: num(extra.target_calories),
  };
}

async function buildTodayMeals(userId, date) {
  const queryDate = /^\d{4}-\d{2}-\d{2}$/.test(date || '')
    ? date
    : new Date().toISOString().split('T')[0];

  const rows = await mealRepository.getMealsByDate(userId, queryDate);
  const grouped = {};
  for (const r of rows) {
    if (!r.food_name) continue;
    if (!grouped[r.meal_type]) {
      grouped[r.meal_type] = { meal_type: r.meal_type, foods: [], calories: 0 };
    }
    grouped[r.meal_type].foods.push(r.food_name);
    grouped[r.meal_type].calories += Number(r.calories) || 0;
  }
  return Object.values(grouped);
}

exports.chat = async (userId, body = {}) => {
  const message = String(body.message || '').trim();
  if (!message) throw httpError('Vui lòng nhập câu hỏi.', 400);
  if (message.length > 1000) throw httpError('Câu hỏi quá dài (tối đa 1000 ký tự).', 400);

  const mode = VALID_MODES.includes(body.mode) ? body.mode : 'advice';

  const history = Array.isArray(body.history)
    ? body.history
        .filter((m) => m && ['user', 'assistant'].includes(m.role) && typeof m.content === 'string' && m.content.trim())
        .slice(-MAX_HISTORY)
        .map((m) => ({ role: m.role, content: m.content }))
    : [];

  const [profile, todayMeals] = await Promise.all([
    buildProfile(userId, body),
    buildTodayMeals(userId, body.date),
  ]);

  try {
    const { data } = await aiClient.post('/chat', {
      message,
      mode,
      profile,
      today_meals: todayMeals,
      history,
    });
    return data; // { reply }
  } catch (err) {
    throw toAiError(err);
  }
};

exports.analyzeFoodImage = async (file, options = {}) => {
  if (!file) throw httpError('Vui lòng chọn ảnh món ăn.', 400);

  const foodName = String(options.food_name || '').trim();
  if (foodName.length > 120) {
    throw httpError('Tên món ăn không được quá 120 ký tự.', 400);
  }

  const amountValue = options.amount_gram;
  const amountGram = amountValue === undefined || amountValue === null || amountValue === ''
    ? null
    : Number(amountValue);
  if (amountGram !== null && (!Number.isFinite(amountGram) || amountGram <= 0 || amountGram > 9999.99)) {
    throw httpError('amount_gram phải lớn hơn 0 và không quá 9999.99.', 400);
  }

  const form = new FormData();
  form.append('file', file.buffer, { filename: file.originalname, contentType: file.mimetype });
  if (foodName) form.append('food_name', foodName);
  if (amountGram !== null) form.append('amount_gram', String(amountGram));

  try {
    const { data } = await aiClient.post('/vision/analyze', form, {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
    });
    return data; // { is_food, note, items[], total_* }
  } catch (err) {
    throw toAiError(err);
  }
};