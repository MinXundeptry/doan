const notFound = (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Không tìm thấy API ${req.method} ${req.originalUrl}.`
  });
};

const handleError = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const statusCode =
    Number.isInteger(error.statusCode) && error.statusCode >= 400
      ? error.statusCode
      : error.type === 'entity.parse.failed'
        ? 400
        : 500;

  if (statusCode >= 500) {
    console.error(error);
  }

  return res.status(statusCode).json({
    status: 'error',
    message: statusCode >= 500 ? 'Lỗi máy chủ nội bộ.' : error.message
  });
};

module.exports = { notFound, handleError };