const express = require('express');
const router = express.Router();
const foodController = require('../../controllers/food.controller');
const { verifyToken } = require('../../middlewares/auth.middleware');
const validateMiddleware = require('../../middlewares/validate.middleware');
const { createFoodDto, updateFoodDto } = require('../../dtos/food.dto');

// Public routes (Ai cũng xem được)
router.get('/', foodController.getFoods);
router.get('/:id', foodController.getFoodById);

// Protected routes (Cần đăng nhập - dùng verifyToken)
router.post('/', verifyToken, validateMiddleware(createFoodDto), foodController.createFood);
router.put('/:id', verifyToken, validateMiddleware(updateFoodDto), foodController.updateFood);
router.delete('/:id', verifyToken, foodController.deleteFood);

module.exports = router;