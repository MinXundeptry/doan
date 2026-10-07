const rbacRepository = require('../repositories/rbac.repository');

const requirePermission = (permissionSlug) => async (req, res, next) => {
  try {
    const hasPermission = await rbacRepository.userHasPermission(
      req.user.id,
      permissionSlug
    );

    if (!hasPermission) {
      return res.status(403).json({
        status: 'error',
        message: 'Bạn không có quyền thực hiện thao tác này.'
      });
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = { requirePermission };