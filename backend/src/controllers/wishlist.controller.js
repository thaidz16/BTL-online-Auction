const db = require('../config/db');

const WishlistController = {
    // Lấy danh sách tài sản yêu thích của user đang đăng nhập
    getMyWishlist: async (req, res) => {
        try {
            const user_id = req.user.id;
            const [rows] = await db.execute(`
                SELECT a.id, a.name, a.description, a.image, a.condition_tag,
                       s.current_price, s.end_time
                FROM wishlist w
                JOIN assets a ON a.id = w.asset_id
                LEFT JOIN auction_sessions s ON a.id = s.asset_id
                WHERE w.user_id = ?
                ORDER BY w.created_at DESC
            `, [user_id]);

            res.status(200).json({ success: true, data: rows });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server!' });
        }
    },

    // Chỉ trả về danh sách asset_id để frontend biết tim nào đang tô đỏ
    getMyWishlistIds: async (req, res) => {
        try {
            const user_id = req.user.id;
            const [rows] = await db.execute('SELECT asset_id FROM wishlist WHERE user_id = ?', [user_id]);
            res.status(200).json({ success: true, data: rows.map(r => r.asset_id) });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server!' });
        }
    },

    addToWishlist: async (req, res) => {
        try {
            const user_id = req.user.id;
            const { assetId } = req.params;

            await db.execute(
                'INSERT IGNORE INTO wishlist (user_id, asset_id) VALUES (?, ?)',
                [user_id, assetId]
            );

            res.status(201).json({ success: true, message: 'Đã thêm vào mục yêu thích!' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server!' });
        }
    },

    removeFromWishlist: async (req, res) => {
        try {
            const user_id = req.user.id;
            const { assetId } = req.params;

            await db.execute('DELETE FROM wishlist WHERE user_id = ? AND asset_id = ?', [user_id, assetId]);

            res.status(200).json({ success: true, message: 'Đã bỏ khỏi mục yêu thích!' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server!' });
        }
    }
};

module.exports = WishlistController;