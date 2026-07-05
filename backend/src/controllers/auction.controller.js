const db = require('../config/db');

const AuctionController = {
    // Admin mở phiên cho tài sản đã duyệt
    createSession: async (req, res) => {
        try {
            const { asset_id, start_price, step_price, start_time, end_time } = req.body;

            // Check tài sản đã duyệt chưa
            const [assetRows] = await db.execute('SELECT status FROM assets WHERE id = ?', [asset_id]);
            if (assetRows.length === 0 || assetRows[0].status !== 'APPROVED') {
                return res.status(400).json({ success: false, message: 'Tài sản chưa được duyệt!' });
            }

            const [result] = await db.execute(
                `INSERT INTO auction_sessions 
                (asset_id, start_price, step_price, current_price, start_time, end_time, status) 
                VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')`,
                [asset_id, start_price, step_price, start_price, start_time, end_time]
            );

            res.status(201).json({ success: true, message: 'Mở phiên đấu giá thành công!', session_id: result.insertId });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server!' });
        }
    }
};

module.exports = AuctionController;