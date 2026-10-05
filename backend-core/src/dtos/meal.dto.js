const Joi = require('joi');

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
};