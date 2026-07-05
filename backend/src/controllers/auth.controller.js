const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');

const AuthController = {
    // ==========================================
    // 1. API ĐĂNG KÝ TÀI KHOẢN (REGISTER)
    // ==========================================
    register: async (req, res) => {
        try {
            // Lấy dữ liệu từ Frontend gửi lên (Lưu ý biến fullname phải khớp với React)
            const { fullname, email, password } = req.body;
            
            // Validate sơ bộ
            if (!fullname || !email || !password) {
                return res.status(400).json({ success: false, message: 'Vui lòng nhập đủ thông tin!' });
            }

            // Check email tồn tại trong Database chưa
            const existingUser = await UserModel.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'Email đã được sử dụng!' });
            }

            // Băm pass (Mã hóa mật khẩu 10 vòng bảo mật)
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Lưu vào Database thông qua Model
            await UserModel.create({ fullname, email, password: hashedPassword });
            
            res.status(201).json({ success: true, message: 'Đăng ký thành công!' });
        } catch (error) {
            console.error("Lỗi Controller Đăng Ký:", error);
            res.status(500).json({ success: false, message: 'Lỗi server nội bộ!' });
        }
    },

    // ==========================================
    // 2. API ĐĂNG NHẬP (LOGIN)
    // ==========================================
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Tìm user theo email
            const user = await UserModel.findByEmail(email);
            if (!user) {
                return res.status(404).json({ success: false, message: 'Tài khoản không tồn tại!' });
            }

            // Giải mã và So khớp password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ success: false, message: 'Sai mật khẩu!' });
            }

            // Ký Token (Giấy thông hành) cho Frontend
            const token = jwt.sign(
                { id: user.id, role: user.role, fullname: user.fullname },
                process.env.JWT_SECRET || 'secret_key_tam_thoi', // Cẩn thận thiếu process.env
                { expiresIn: '1d' } // Hết hạn sau 1 ngày
            );

            // Xóa pass khỏi object trước khi gửi về Frontend để bảo mật
            delete user.password;

            res.status(200).json({ 
                success: true, 
                message: 'Đăng nhập thành công!', 
                token, 
                user 
            });
        } catch (error) {
            console.error("Lỗi Controller Đăng Nhập:", error);
            res.status(500).json({ success: false, message: 'Lỗi server nội bộ!' });
        }
    }
};

module.exports = AuthController;