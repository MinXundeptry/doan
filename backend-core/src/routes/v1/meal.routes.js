const express = require('express');
const router = express.Router();
const mealController = require('../../controllers/meal.controller');
const { verifyToken } = require('../../middlewares/auth.middleware');

router.post('/', verifyToken, mealController.logMeal);
router.get('/daily', verifyToken, mealController.getDailyMeals);

module.exports = router;
// GET /api/v1/meals/progress?date=2026-09-29
router.get('/progress', verifyToken, mealController.getCalorieProgress);