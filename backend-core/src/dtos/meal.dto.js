const Joi = require('joi');

<<<<<<< HEAD
const date = Joi.string()
  .pattern(/^\d{4}-\d{2}-\d{2}$/)
  .custom((value, helpers) => {
    const parsed = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
      return helpers.error('date.invalid');
    }
    return value;
  })
  .messages({
    'string.pattern.base': 'date phải đúng định dạng YYYY-MM-DD.',
    'date.invalid': 'date không phải ngày hợp lệ.'
  });

const mealType = Joi.string().valid('breakfast', 'lunch', 'dinner', 'snack');
const amountGram = Joi.number().positive().max(9999.99);

module.exports = {
  createMeal: Joi.object({
    meal_type: mealType.required(),
    meal_date: date.optional(),
    items: Joi.array()
      .items(
        Joi.object({
          food_id: Joi.number().integer().positive().required(),
          amount_gram: amountGram.required()
        }).required()
      )
      .min(1)
      .required()
  }),
  updateMealItem: Joi.object({
    amount_gram: amountGram.required()
  }),
  itemParams: Joi.object({
    itemId: Joi.number().integer().positive().required()
  }),
  mealParams: Joi.object({
    mealId: Joi.number().integer().positive().required()
  }),
  dailySummary: Joi.object({
    date: date.optional()
  })
=======
const createMealDto = Joi.object({
  meal_type: Joi.string()
    .valid('breakfast', 'lunch', 'dinner', 'snack')
    .required()
    .messages({
      'any.only': 'Loại bữa ăn phải là: breakfast, lunch, dinner, hoặc snack',
      'any.required': 'Loại bữa ăn không được để trống',
    }),

  food_name: Joi.string().trim().required().messages({
    'string.empty': 'Tên thực phẩm không được để trống',
    'any.required': 'Tên thực phẩm là bắt buộc',
  }),

  calories: Joi.number().min(0).required().messages({
    'number.min': 'Số calo không được nhỏ hơn 0',
    'any.required': 'Số calo là bắt buộc',
  }),

  protein: Joi.number().min(0).default(0),
  carbs: Joi.number().min(0).default(0),
  fat: Joi.number().min(0).default(0),
  serving_size: Joi.number().min(0.1).default(1),
  date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Định dạng ngày phải là YYYY-MM-DD',
    }),
});

module.exports = {
  createMealDto,
>>>>>>> origin/main
};