const mealService = require('../services/meal.service');

exports.logMeal = async (req, res, next) => {
  try {
    const result = await mealService.logMeal(req.user.id, req.body);
    res.status(201).json({
      status: 'success',
      message: 'Ghi nhận bữa ăn thành công',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.getDailySummary = async (req, res, next) => {
  try {
    const { date } = req.query;
    const result = await mealService.getDailySummary(req.user.id, date);
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.updateMealItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { amount_gram: amountGram } = req.body;
    const result = await mealService.updateMealItemQuantity(
      req.user.id,
      itemId,
      amountGram
    );
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteMealItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const result = await mealService.deleteMealItem(req.user.id, itemId);
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteMeal = async (req, res, next) => {
  try {
    const { mealId } = req.params;
    const result = await mealService.deleteMeal(req.user.id, mealId);
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};