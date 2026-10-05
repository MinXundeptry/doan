const db = require('../config/database');

class FoodRepository {
  // Lấy danh sách thực phẩm (có phân trang & tìm kiếm theo tên)
  async findAll({ search, limit = 20, offset = 0 }) {
    let query = 'SELECT * FROM foods WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND name LIKE ?';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const [rows] = await db.query(query, params);
    return rows;
  }

  // Lấy chi tiết món ăn theo ID
  async findById(id) {
    const [rows] = await db.query('SELECT * FROM foods WHERE id = ?', [id]);
    return rows[0] || null;
  }

  // Thêm thực phẩm mới
  async create(foodData) {
    const { name, calories, protein, carbs, fat, serving_unit, is_custom, created_by } = foodData;
    const [result] = await db.query(
      `INSERT INTO foods (name, calories, protein, carbs, fat, serving_unit, is_custom, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, calories, protein, carbs, fat, serving_unit || '100g', is_custom || 0, created_by || null]
    );
    return result.insertId;
  }

  // Cập nhật thực phẩm
  async update(id, foodData) {
    const fields = [];
    const values = [];

    Object.keys(foodData).forEach((key) => {
      fields.push(`${key} = ?`);
      values.push(foodData[key]);
    });

    if (fields.length === 0) return false;

    values.push(id);
    const [result] = await db.query(`UPDATE foods SET ${fields.join(', ')} WHERE id = ?`, values);
    return result.affectedRows > 0;
  }

  // Xóa thực phẩm
  async delete(id) {
    const [result] = await db.query('DELETE FROM foods WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = new FoodRepository();