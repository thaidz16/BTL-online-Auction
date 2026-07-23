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
                WHERE s.status = 'ACTIVE'
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
            const { status, start_price, step_price, duration_days } = req.body;

            if (!['APPROVED', 'REJECTED'].includes(status)) {
                return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ!' });
            }

            // Khi duyệt lên sàn, bắt buộc phải có giá khởi điểm/bước giá để mở phiên đấu giá
            if (status === 'APPROVED' && (!start_price || !step_price)) {
                return res.status(400).json({ success: false, message: 'Cần nhập giá khởi điểm và bước giá để mở phiên đấu giá!' });
            }

            const [result] = await db.execute('UPDATE assets SET status = ? WHERE id = ?', [status, id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy tài sản!' });
            }

            if (status === 'APPROVED') {
                const days = Number(duration_days) > 0 ? Number(duration_days) : 3;
                // Đây là bước còn thiếu ở bản cũ: phải tạo phiên đấu giá ACTIVE thì tài sản mới lên trang chủ
                await db.execute(
                    `INSERT INTO auction_sessions (asset_id, start_price, step_price, current_price, start_time, end_time, status)
                     VALUES (?, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? DAY), 'ACTIVE')
                     ON DUPLICATE KEY UPDATE
                        start_price = VALUES(start_price), step_price = VALUES(step_price),
                        current_price = VALUES(current_price), start_time = VALUES(start_time),
                        end_time = VALUES(end_time), status = 'ACTIVE'`,
                    [id, start_price, step_price, start_price, days]
                );
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