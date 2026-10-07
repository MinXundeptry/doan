const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = require('./src/config/database');
const routesV1 = require('./src/routes/v1'); // Gọi router trung tâm v1
const { notFound, handleError } = require('./src/middlewares/error.middleware');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Đăng ký Router v1 duy nhất cho tất cả API
app.use('/api/v1', routesV1);

// Health Check API
app.get('/api/v1/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    res.status(200).json({
      status: 'success',
      message: 'Node.js Core Server hoạt động bình thường!',
      db_status: rows[0].result === 2 ? 'Connected' : 'Disconnected'
    });
  } catch (error) {
    console.error('Health check database error:', error);
    res.status(500).json({ status: 'error', message: 'Không thể kết nối cơ sở dữ liệu.' });
  }
});

app.use(notFound);
app.use(handleError);

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 [Node.js Core] Server đang chạy tại: http://localhost:${PORT}`);
  });
}

module.exports = app;