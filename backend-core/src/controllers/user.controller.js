const userService = require('../services/user.service');

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy từ auth.middleware
    const profile = await userService.getProfile(userId);
    res.status(200).json({
      status: 'success',
      data: profile
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updatedProfile = await userService.updateProfile(userId, req.body);
    res.status(200).json({
      status: 'success',
      message: 'Cập nhật hồ sơ thể trạng thành công!',
      data: updatedProfile
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};