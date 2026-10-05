const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');

// Đăng ký các module API v1
router.use('/auth', authRoutes);   // -> Endpoint: /api/v1/auth/...
router.use('/user', userRoutes);   // -> Endpoint: /api/v1/user/...

module.exports = router;