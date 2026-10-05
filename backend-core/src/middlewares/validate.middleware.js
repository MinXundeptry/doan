/**
 * Middleware kiểm tra (validate) dữ liệu đầu vào dựa trên Joi schema
 * @param {Object} schema - Joi schema object từ DTO
 */
const validateMiddleware = (schema) => {
  return (req, res, next) => {
    if (!schema) {
      return next();
    }

    // Validate req.body với schema
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Trả về tất cả các lỗi thay vì dừng ở lỗi đầu tiên
      stripUnknown: true, // Loại bỏ các trường thừa không nằm trong schema
    });

    if (error) {
      const errorDetails = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu đầu vào không hợp lệ',
        errors: errorDetails,
      });
    }

    // Gán dữ liệu đã qua xử lý/clean back vào req.body
    req.body = value;
    next();
  };
};

module.exports = validateMiddleware;