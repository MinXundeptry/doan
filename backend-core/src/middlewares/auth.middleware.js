const jwt = require('jsonwebtoken');
const { requirePermission } = require('./role.middleware');
const userRepository = require('../repositories/user.repository');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <token>"

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Không tìm thấy Token xác thực. Vui lòng đăng nhập!'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!(await userRepository.isActive(decoded.id))) {
      return res.status(423).json({
        status: 'error',
        message: 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.'
      });
    }
    req.user = decoded; // Dữ liệu giải mã: { id, role, email }
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(403).json({
        status: 'error',
        message: 'Token không hợp lệ hoặc đã hết hạn!'
      });
    }
    return next(error);
  }
  return next();
};

const requireAdmin = requirePermission('users:read');

module.exports = {
  verifyToken,
  requireAdmin
};