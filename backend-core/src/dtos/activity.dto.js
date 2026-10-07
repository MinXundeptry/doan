const Joi = require('joi');

const activityTypes = [
  'walking',
  'running',
  'cycling',
  'swimming',
  'strength_training',
  'yoga'
];

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

module.exports = {
  createActivity: Joi.object({
    activity_type: Joi.string().valid(...activityTypes).required(),
    duration_minutes: Joi.number().integer().min(1).max(1440).required(),
    activity_date: Joi.string().pattern(datePattern)
  }).unknown(false),
  dailyQuery: Joi.object({
    date: Joi.string().pattern(datePattern)
  }).unknown(false),
  idParams: Joi.object({
    id: Joi.number().integer().positive().required()
  })
};
