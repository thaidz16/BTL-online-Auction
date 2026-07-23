const db = require('../config/db');

const AssetController = {
    createAsset: async (req, res) => {
        try {
            const seller_id = req.user.id;
            const { category_id, name, description, image, condition_tag, specifications } = req.body;
            
            if (!name || !description || !image) {
                return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc!' });
            }

            // Người bán tự nhập thông số kỹ thuật (key-value) khi đăng bán.
            // Không còn lấy dữ liệu mẫu (mock) cứng nữa - nếu không nhập gì thì lưu NULL.
            let specsToSave = null;
            if (specifications) {
                if (typeof specifications === 'string') {
                    // Đã là chuỗi JSON gửi từ frontend -> validate lại cho chắc rồi lưu nguyên chuỗi
                    try {
                        const parsed = JSON.parse(specifications);
                        if (parsed && Object.keys(parsed).length > 0) {
                            specsToSave = JSON.stringify(parsed);
                        }
                    } catch (e) {
                        specsToSave = null;
                    }
                } else if (typeof specifications === 'object' && Object.keys(specifications).length > 0) {
                    specsToSave = JSON.stringify(specifications);
                }
            }

            const [result] = await db.execute(
                "INSERT INTO assets (seller_id, category_id, name, description, image, condition_tag, specifications, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING')",
                [seller_id, category_id || 1, name, description, image, condition_tag || 'Mới 100%', specsToSave]
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
    },

    // Lấy toàn bộ tin đăng của CHÍNH người bán đang đăng nhập (để họ tự quản lý/xoá)
    getMyAssets: async (req, res) => {
        try {
            const seller_id = req.user.id;

            const [rows] = await db.execute(`
                SELECT a.*, s.status AS session_status, s.current_price, s.end_time, s.winner_id
                FROM assets a
                LEFT JOIN auction_sessions s ON a.id = s.asset_id
                WHERE a.seller_id = ?
                ORDER BY a.created_at DESC
            `, [seller_id]);

            res.status(200).json({ success: true, data: rows });
        } catch (error) {
            console.error("Lỗi API getMyAssets:", error);
            res.status(500).json({ success: false, message: 'Lỗi server!' });
        }
    },

    // Cho admin xem TOÀN BỘ tài sản (mọi trạng thái) để quản lý/gỡ khỏi sàn khi cần
    getAllAssetsForAdmin: async (req, res) => {
        try {
            const [rows] = await db.execute(`
                SELECT a.*, s.status AS session_status, s.current_price, s.end_time, s.winner_id
                FROM assets a
                LEFT JOIN auction_sessions s ON a.id = s.asset_id
                ORDER BY a.created_at DESC
            `);

            res.status(200).json({ success: true, data: rows });
        } catch (error) {
            console.error("Lỗi API getAllAssetsForAdmin:", error);
            res.status(500).json({ success: false, message: 'Lỗi server!' });
        }
    },

    // Xoá/Huỷ 1 tin đăng.
    // - Người bán: chỉ được xoá tin của chính mình, và CHỈ khi chưa có ai đặt giá (tránh mất công bằng với người đã tham gia).
    // - Admin: được xoá bất kỳ tin nào, kể cả đã có người đấu giá thành công/đã bán (gỡ khỏi sàn).
    deleteAsset: async (req, res) => {
        try {
            const { id } = req.params;
            const isAdmin = req.user.role === 'ADMIN';

            const [assetRows] = await db.execute('SELECT * FROM assets WHERE id = ?', [id]);
            if (assetRows.length === 0) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy tài sản này!' });
            }
            const asset = assetRows[0];

            if (!isAdmin && asset.seller_id !== req.user.id) {
                return res.status(403).json({ success: false, message: 'Bạn không có quyền xoá tin đăng này!' });
            }

            if (!isAdmin) {
                // Người bán thường: chặn xoá nếu đã có người đặt giá cho tài sản này
                const [bidCountRows] = await db.execute(`
                    SELECT COUNT(*) AS total FROM bids b
                    JOIN auction_sessions s ON b.session_id = s.id
                    WHERE s.asset_id = ?
                `, [id]);

                if (bidCountRows[0].total > 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Sản phẩm đã có người đặt giá, bạn không thể tự xoá. Vui lòng liên hệ quản trị viên nếu thực sự cần gỡ bỏ.'
                    });
                }
            }

            // FK trong bảng auction_sessions/bids đã khai báo ON DELETE CASCADE nên xoá asset
            // sẽ tự động dọn theo cả phiên đấu giá và lịch sử đặt giá liên quan.
            await db.execute('DELETE FROM assets WHERE id = ?', [id]);

            res.status(200).json({ success: true, message: 'Đã xoá tin đăng thành công!' });
        } catch (error) {
            console.error("Lỗi API deleteAsset:", error);
            res.status(500).json({ success: false, message: 'Lỗi server!' });
        }
    }
};

module.exports = AssetController;