const Joi = require('joi');

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
};