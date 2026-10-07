const jwt = require('jsonwebtoken');
const { requirePermission } = require('./role.middleware');

const verifyToken = (req, res, next) => {
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
    req.user = decoded; // Dữ liệu giải mã: { id, role, email }
    next();
  } catch (error) {
    return res.status(403).json({
      status: 'error',
      message: 'Token không hợp lệ hoặc đã hết hạn!'
    });
  }
};

const requireAdmin = requirePermission('users:read');

module.exports = {
  verifyToken,
  requireAdmin
};