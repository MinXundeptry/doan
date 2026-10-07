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
    'string.pattern.base': 'Ngày phải đúng định dạng YYYY-MM-DD.',
    'date.invalid': 'Ngày không hợp lệ.'
  });

module.exports = {
  weeklyQuery: Joi.object({ end_date: date }).unknown(false)
};
