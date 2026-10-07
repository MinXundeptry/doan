const express = require('express');
const router = express.Router();
const foodController = require('../../controllers/food.controller');
const { verifyToken } = require('../../middlewares/auth.middleware');
const { requirePermission } = require('../../middlewares/role.middleware');
const validateMiddleware = require('../../middlewares/validate.middleware');
const { createFoodDto, updateFoodDto } = require('../../dtos/food.dto');
const Joi = require('joi');
const foodIdParams = Joi.object({
  id: Joi.number().integer().positive().required(),
});

// Public routes (Ai cũng xem được)
router.get('/', foodController.getFoods);
router.get('/:id', foodController.getFoodById);

// Protected routes (Cần đăng nhập - dùng verifyToken)
router.post(
  '/',
  verifyToken,
  requirePermission('foods:manage'),
  validateMiddleware(createFoodDto),
  foodController.createFood
);
router.put(
  '/:id',
  verifyToken,
  requirePermission('foods:manage'),
  validateMiddleware(foodIdParams, 'params'),
  validateMiddleware(updateFoodDto),
  foodController.updateFood
);
router.delete(
  '/:id',
  verifyToken,
  requirePermission('foods:manage'),
  validateMiddleware(foodIdParams, 'params'),
  foodController.deleteFood
);

module.exports = router;