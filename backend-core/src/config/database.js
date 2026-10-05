const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'nutrition_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Kiểm tra kết nối CSDL khi khởi động
pool.getConnection()
  .then(connection => {
    console.log('✅ [MySQL] Kết nối CSDL XAMPP thành công!');
    connection.release();
  })
  .catch(err => {
    console.error('❌ [MySQL] Lỗi kết nối CSDL:', err.message);
  });

module.exports = pool;