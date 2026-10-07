const express = require('express');
const multer = require('multer');
const router = express.Router();https://github.com/MinXundeptry/doan/pull/7/conflict?name=backend-core%252Fsrc%252Froutes%252Fv1%252Fai.routes.js&base_oid=7ca493d08a65e59db40920b1ce5fbdbdb0a80f17&head_oid=e517cfad17d931f98d725e1d88e384ae872f9acf
const aiController = require('../../controllers/ai.controller');
const { verifyToken } = require('../../middlewares/auth.middleware');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// POST /api/v1/ai/chat
router.post('/chat', verifyToken, aiController.chat);
// POST /api/v1/ai/analyze-image  (form-data, field tên "image")
router.post('/analyze-image', verifyToken, upload.single('image'), aiController.analyzeImage);

module.exports = router;