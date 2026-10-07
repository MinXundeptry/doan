const aiProxyService = require('../services/ai-proxy.service');

exports.chat = async (req, res) => {
  try {
    const data = await aiProxyService.chat(req.user.id, req.body);
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    res.status(error.statusCode || 500).json({ status: 'error', message: error.message });
  }
};

exports.analyzeImage = async (req, res) => {
  try {
    const data = await aiProxyService.analyzeFoodImage(req.file, req.body);
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    res.status(error.statusCode || 500).json({ status: 'error', message: error.message });
  }
};