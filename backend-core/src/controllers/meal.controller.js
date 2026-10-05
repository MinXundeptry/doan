const mealService = require('../services/meal.service');

exports.logMeal = async (req, res) => {
  try {
    const userId = req.user.id;
    const mealData = { ...req.body, user_id: userId };
    const newMeal = await mealService.createMeal(mealData);

    res.status(201).json({
      status: 'success',
      message: 'Ghi nhận bữa ăn thành công!',
      data: newMeal
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

exports.getDailyMeals = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.query; // YYYY-MM-DD
    const summary = await mealService.getMealsByDate(userId, date);

    res.status(200).json({
      status: 'success',
      data: summary
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

exports.getCalorieProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.query; // YYYY-MM-DD (không bắt buộc)

    const progress = await mealService.getCalorieProgress(userId, date);

    res.status(200).json({
      status: 'success',
      data: progress
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};