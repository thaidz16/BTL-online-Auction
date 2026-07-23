const db = require('../config/db');

const AssetController = {
    createAsset: async (req, res) => {
        try {
            const seller_id = req.user.id;
            const { category_id, name, description, image, condition_tag } = req.body;
            
            if (!name || !description || !image) {
                return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc!' });
            }

            const [result] = await db.execute(
                "INSERT INTO assets (seller_id, category_id, name, description, image, condition_tag, status) VALUES (?, ?, ?, ?, ?, ?, 'PENDING')",
                [seller_id, category_id || 1, name, description, image, condition_tag || 'Mới 100%']
            );

            res.status(201).json({ success: true, message: 'Đăng tài sản thành công, đang chờ duyệt!', asset_id: result.insertId });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server!' });
        }
    },

    getApprovedAssets: async (req, res) => {
        try {
            const [rows] = await db.execute(`
                SELECT a.id, a.name, a.description, a.image, a.condition_tag,
                       s.current_price, s.end_time 
                FROM assets a
                JOIN auction_sessions s ON a.id = s.asset_id
                WHERE s.status = 'active'
                ORDER BY s.end_time ASC
            `);

            res.status(200).json({ success: true, data: rows });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server!' });
        }
    },

    approveAsset: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body; 

            if (!['APPROVED', 'REJECTED'].includes(status)) {
                return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ!' });
            }

            const [result] = await db.execute('UPDATE assets SET status = ? WHERE id = ?', [status, id]);
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy tài sản!' });
            }

            res.status(200).json({ success: true, message: `Đã cập nhật trạng thái thành ${status}` });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server!' });
        }
    },

    getPendingAssets: async (req, res) => {
        try {
            const [rows] = await db.execute(`SELECT * FROM assets WHERE status = 'PENDING' ORDER BY created_at DESC`);
            res.status(200).json({ success: true, data: rows });
        } catch (error) {
            console.error("Lỗi API getPendingAssets:", error);
            res.status(500).json({ success: false, message: 'Lỗi server!' });
        }
    },

    getAssetById: async (req, res) => {
        try {
            const { id } = req.params;
            
            const [rows] = await db.execute(`
                SELECT a.*, s.current_price, s.end_time 
                FROM assets a
                LEFT JOIN auction_sessions s ON a.id = s.asset_id
                WHERE a.id = ?
            `, [id]);

            if (rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy tài sản này!' });
            }

            res.status(200).json({ success: true, data: rows[0] });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server!' });
        }
    }
};

module.exports = AssetController;