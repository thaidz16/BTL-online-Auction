const db = require('../config/db');

const AssetController = {
    // 1. User tạo tài sản mới
    createAsset: async (req, res) => {
        try {
            const seller_id = req.user.id;
            const { category_id, name, description, images } = req.body;
            
            if (!category_id || !name) {
                return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc!' });
            }
            const imagesJson = JSON.stringify(images || []); 

            const [result] = await db.execute(
                'INSERT INTO assets (seller_id, category_id, name, description, images) VALUES (?, ?, ?, ?, ?)',
                [seller_id, category_id, name, description, imagesJson]
            );

            res.status(201).json({ success: true, message: 'Đăng tài sản thành công, đang chờ duyệt!', asset_id: result.insertId });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server!' });
        }
    },


    getApprovedAssets: async (req, res) => {
        try {
            // Dùng JOIN để lấy luôn tên danh mục và tên người bán cho xịn
            const query = `
                SELECT a.*, c.name as category_name, u.fullname as seller_name 
                FROM assets a 
                JOIN categories c ON a.category_id = c.id 
                JOIN users u ON a.seller_id = u.id 
                WHERE a.status = 'APPROVED'
                ORDER BY a.created_at DESC
            `;
            const [rows] = await db.execute(query);
            res.status(200).json({ success: true, data: rows });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server!' });
        }
    },

    // 3. Admin duyệt tài sản
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
    }
};

module.exports = AssetController;