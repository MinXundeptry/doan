const Joi = require('joi');

const createFoodDto = Joi.object({
  name: Joi.string().trim().required().messages({
    'string.empty': 'Tên thực phẩm không được để trống',
  }),
  calories: Joi.number().min(0).default(0),
  protein: Joi.number().min(0).default(0),
  carbs: Joi.number().min(0).default(0),
  fat: Joi.number().min(0).default(0),
  serving_unit: Joi.string().default('100g'),
  is_custom: Joi.boolean().default(false),
});

const updateFoodDto = Joi.object({
  name: Joi.string().trim(),
  calories: Joi.number().min(0),
  protein: Joi.number().min(0),
  carbs: Joi.number().min(0),
  fat: Joi.number().min(0),
  serving_unit: Joi.string(),
});

module.exports = {
  createFoodDto,
  updateFoodDto,
};