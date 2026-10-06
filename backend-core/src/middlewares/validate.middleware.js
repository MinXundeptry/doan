const validateMiddleware = (schema, property = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[property], {
    abortEarly: false,
    convert: true,
    stripUnknown: true
  });

  if (error) {
    const validationError = new Error(
      error.details.map((detail) => detail.message).join(' ')
    );
    validationError.statusCode = 400;
    return next(validationError);
  }

  req[property] = value;
  return next();
};

module.exports = validateMiddleware;
