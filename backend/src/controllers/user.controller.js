const db = require('../config/db');

const UserController = {
    // Lấy thông tin cá nhân + số dư ví
    getProfile: async (req, res) => {
        try {
            const [rows] = await db.execute(
                'SELECT id, fullname, email, role, balance, avatar, created_at FROM users WHERE id = ?', 
                [req.user.id]
            );
            if (rows.length === 0) return res.status(404).json({ success: false, message: 'User không tồn tại!' });
            res.status(200).json({ success: true, data: rows[0] });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Lỗi server!' });
        }
    },

    // User gửi yêu cầu nạp tiền
    requestDeposit: async (req, res) => {
        const { amount } = req.body;
        try {
            await db.execute('INSERT INTO deposits (user_id, amount, status) VALUES (?, ?, "PENDING")', [req.user.id, amount]);
            res.status(201).json({ success: true, message: 'Yêu cầu nạp tiền đã gửi!' });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Lỗi server!' });
        }
    },

    getPendingDeposits: async (req, res) => {
        try {
            const [rows] = await db.execute(`
                SELECT d.*, u.email as user_email 
                FROM deposits d 
                JOIN users u ON d.user_id = u.id 
                WHERE d.status = 'PENDING'
                ORDER BY d.created_at ASC
            `);
            res.status(200).json({ success: true, data: rows });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Lỗi server!' });
        }
    },

    // Admin duyệt nạp tiền
    approveDeposit: async (req, res) => {
        const { deposit_id, user_id, amount } = req.body;
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            await connection.execute('UPDATE users SET balance = balance + ? WHERE id = ?', [amount, user_id]);
            await connection.execute('UPDATE deposits SET status = "COMPLETED" WHERE id = ?', [deposit_id]);
            await connection.commit();
            res.status(200).json({ success: true, message: 'Duyệt tiền thành công!' });
        } catch (error) {
            await connection.rollback();
            res.status(500).json({ success: false, message: 'Lỗi duyệt tiền!' });
        } finally {
            connection.release();
        }
    }
};

module.exports = UserController;