const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const foodRoutes = require('./food.routes');
const mealRoutes = require('./meal.routes');

// Đăng ký các module API v1
router.use('/auth', authRoutes);   // -> Endpoint: /api/v1/auth/...
router.use('/user', userRoutes);   // -> Endpoint: /api/v1/user/...
router.use('/foods', foodRoutes);
router.use('/meals', mealRoutes);   // -> Endpoint: /api/v1/meals/...
router.use('/ai', require('./ai.routes')); // -> Endpoint: /api/v1/ai/...

module.exports = router;