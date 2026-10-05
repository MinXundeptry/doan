const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const mealRoutes = require('./meal.routes');

router.use('/meals', mealRoutes);

// Đăng ký các module API v1
router.use('/auth', authRoutes);
router.use('/user', userRoutes);

module.exports = router;