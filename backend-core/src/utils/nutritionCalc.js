/**
 * Tính BMR (Mifflin-St Jeor Equation)
 */
const calculateBMR = (gender, weightKg, heightCm, age) => {
  if (gender === 'male') {
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }
};

/**
 * Tính TDEE dựa trên mức độ vận động
 */
const calculateTDEE = (bmr, activityLevel) => {
  const multipliers = {
    sedentary: 1.2,          // Ít vận động / Văn phòng
    lightly_active: 1.375,   // Vận động nhẹ (1-3 buổi/tuần)
    moderately_active: 1.55, // Vận động vừa (3-5 buổi/tuần)
    very_active: 1.725       // Vận động nhiều (6-7 buổi/tuần)
  };

  const multiplier = multipliers[activityLevel] || 1.2;
  return bmr * multiplier;
};

module.exports = {
  calculateBMR,
  calculateTDEE
};