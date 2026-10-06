const express = require('express');
const router = express.Router();
const mealController = require('../../controllers/meal.controller');
const { verifyToken } = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const mealDto = require('../../dtos/meal.dto');

router.use(verifyToken);

router.post('/', validate(mealDto.createMeal), mealController.logMeal);
router.get(
  '/daily',
  validate(mealDto.dailySummary, 'query'),
  mealController.getDailySummary
);
router.put(
  '/items/:itemId',
  validate(mealDto.itemParams, 'params'),
  validate(mealDto.updateMealItem),
  mealController.updateMealItem
);
router.delete(
  '/items/:itemId',
  validate(mealDto.itemParams, 'params'),
  mealController.deleteMealItem
);
router.delete(
  '/:mealId',
  validate(mealDto.mealParams, 'params'),
  mealController.deleteMeal
);

module.exports = router;