const db = require('../config/db');

const CategoryController = {
    // Lấy tất cả danh mục (Ai cũng xem được)
    getAll: async (req, res) => {
        try {
            const [rows] = await db.execute('SELECT * FROM categories ORDER BY created_at DESC');
            res.status(200).json({ success: true, data: rows });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server!' });
        }
    },

    // Tạo danh mục mới (Chỉ Admin)
    create: async (req, res) => {
        try {
            const { name, description } = req.body;
            if (!name) {
                return res.status(400).json({ success: false, message: 'Tên danh mục là bắt buộc!' });
            }

            const [result] = await db.execute(
                'INSERT INTO categories (name, description) VALUES (?, ?)',
                [name, description || null]
            );
            res.status(201).json({ success: true, message: 'Tạo danh mục thành công!', id: result.insertId });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server!' });
        }
    }
};

module.exports = CategoryController;