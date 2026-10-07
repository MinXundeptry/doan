const express = require('express');
const router = express.Router();
const mealController = require('../../controllers/meal.controller');
const { verifyToken } = require('../../middlewares/auth.middleware');
const { requirePermission } = require('../../middlewares/role.middleware');
const validate = require('../../middlewares/validate.middleware');
const mealDto = require('../../dtos/meal.dto');

router.use(verifyToken);

router.post(
  '/',
  requirePermission('meals:create'),
  validate(mealDto.createMeal),
  mealController.logMeal
);
router.get(
  '/daily',
  requirePermission('meals:read'),
  validate(mealDto.dailySummary, 'query'),
  mealController.getDailySummary
);
router.put(
  '/items/:itemId',
  requirePermission('meals:update'),
  validate(mealDto.itemParams, 'params'),
  validate(mealDto.updateMealItem),
  mealController.updateMealItem
);
router.delete(
  '/items/:itemId',
  requirePermission('meals:delete'),
  validate(mealDto.itemParams, 'params'),
  mealController.deleteMealItem
);
router.delete(
  '/:mealId',
  requirePermission('meals:delete'),
  validate(mealDto.mealParams, 'params'),
  mealController.deleteMeal
);

module.exports = router;