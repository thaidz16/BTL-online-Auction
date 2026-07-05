const db = require('../config/db');

const AuctionController = {
    // Mở phiên đấu giá
    createSession: async (req, res) => {
        try {
            const { asset_id, start_price, step_price, start_time, end_time } = req.body;
            const [result] = await db.execute(
                `INSERT INTO auction_sessions (asset_id, start_price, current_price, step_price, start_time, end_time, status) 
                 VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')`,
                [asset_id, start_price, start_price, step_price, start_time, end_time]
            );
            res.status(201).json({ success: true, session_id: result.insertId });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Lỗi server!' });
        }
    },

    // Người dùng đặt giá (Có Transaction an toàn)
    placeBid: async (req, res) => {
        const { session_id, bid_amount } = req.body;
        const userId = req.user.id;
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            // 1. Check phiên
            const [session] = await connection.execute('SELECT * FROM auction_sessions WHERE id = ? AND status = "ACTIVE"', [session_id]);
            if (session.length === 0) throw new Error('Phiên đã kết thúc!');

            // 2. Check số dư (Dùng FOR UPDATE để khóa dòng, tránh đua lệnh)
            const [user] = await connection.execute('SELECT balance FROM users WHERE id = ? FOR UPDATE', [userId]);
            if (user[0].balance < bid_amount) throw new Error('Số dư không đủ!');

            // 3. Trừ tiền và ghi nhận
            await connection.execute('UPDATE users SET balance = balance - ? WHERE id = ?', [bid_amount, userId]);
            await connection.execute('INSERT INTO bids (session_id, user_id, amount) VALUES (?, ?, ?)', [session_id, userId, bid_amount]);
            await connection.execute('UPDATE auction_sessions SET current_price = ? WHERE id = ?', [bid_amount, session_id]);

            await connection.commit();
            res.status(200).json({ success: true, message: 'Đấu giá thành công!' });
        } catch (error) {
            await connection.rollback();
            res.status(400).json({ success: false, message: error.message });
        } finally {
            connection.release();
        }
    }
};

module.exports = AuctionController;