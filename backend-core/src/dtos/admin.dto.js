const Joi = require('joi');

const idParams = Joi.object({
  id: Joi.number().integer().positive().required()
});

const listUsersQuery = Joi.object({
  page: Joi.number().integer().positive().default(1).messages({
    'number.base': 'page phải là số nguyên dương.',
    'number.integer': 'page phải là số nguyên dương.',
    'number.positive': 'page phải là số nguyên dương.'
  }),
  limit: Joi.number().integer().min(1).max(100).default(20).messages({
    'number.base': 'limit phải từ 1 đến 100.',
    'number.integer': 'limit phải từ 1 đến 100.',
    'number.min': 'limit phải từ 1 đến 100.',
    'number.max': 'limit phải từ 1 đến 100.'
  }),
  search: Joi.string().trim().max(100),
  role_id: Joi.number().integer().min(1).max(2)
}).unknown(false);

const assignRoleBody = Joi.object({
  role: Joi.string().valid('admin', 'user'),
  role_id: Joi.number().integer().min(1).max(2)
})
  .xor('role', 'role_id')
  .unknown(false);

const userStatusBody = Joi.object({
  is_active: Joi.boolean().required()
}).unknown(false);

module.exports = {
  idParams,
  listUsersQuery,
  assignRoleBody,
  userStatusBody
};
