/**
 * Chuẩn hóa phản hồi thành công (Success Response)
 */
const successResponse = (res, data = null, message = 'Thành công', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Chuẩn hóa phản hồi thất bại / lỗi (Error Response)
 */
const errorResponse = (res, message = 'Có lỗi xảy ra', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  successResponse,
  errorResponse,
};