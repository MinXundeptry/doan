const express = require('express');
const multer = require('multer');
const router = express.Router();
const aiController = require('../../controllers/ai.controller');
const { verifyToken } = require('../../middlewares/auth.middleware');
const { requirePermission } = require('../../middlewares/role.middleware');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// POST /api/v1/ai/chat
router.post(
  '/chat',
  verifyToken,
  requirePermission('ai:use'),
  aiController.chat
);
// POST /api/v1/ai/analyze-image  (form-data, field tên "image")
router.post(
  '/analyze-image',
  verifyToken,
  requirePermission('ai:use'),
  upload.single('image'),
  aiController.analyzeImage
);

module.exports = router;