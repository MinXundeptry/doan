const authService = require('../services/auth.service');

const register = async (req, res) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({
      status: 'success',
      message: 'Đăng ký tài khoản thành công!',
      data: result
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.status(200).json({
      status: 'success',
      message: 'Đăng nhập thành công!',
      data: result
    });
  } catch (error) {
    res.status(error.statusCode || 401).json({
      status: 'error',
      message: error.message
    });
  }
};

module.exports = {
  register,
  login
};