const db = require('../config/db');

const UserController = {
    getProfile: async (req, res) => {
        try {
            const userId = req.user.id; // Lấy từ Middleware verifyToken
            const [rows] = await db.execute('SELECT id, fullname, email, role, avatar, created_at FROM users WHERE id = ?', [userId]);
            
            if (rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng!' });
            }

            res.status(200).json({ success: true, data: rows[0] });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server!' });
        }
    }
};

module.exports = UserController;