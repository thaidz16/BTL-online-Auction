const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');
const sendEmail = require('../utils/sendEmail');
const db = require('../config/db'); // Gọi thêm db để thao tác trực tiếp với bảng users cho linh hoạt

const AuthController = {
    register: async (req, res) => {
        try {
            const { fullname, email, password } = req.body;
            
            // 1. Validate sơ bộ
            if (!fullname || !email || !password) {
                return res.status(400).json({ success: false, message: 'Vui lòng nhập đủ thông tin!' });
            }

            // 2. Check email tồn tại
            const existingUser = await UserModel.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'Email đã được sử dụng!' });
            }

            // 3. Băm pass (Mã hóa mật khẩu 10 vòng bảo mật)
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // 4. Sinh mã OTP 6 số ngẫu nhiên
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

            // 5. Lưu vào Database (Mặc định is_verified = false)
            // Dùng db.execute trực tiếp để đảm bảo ăn khớp với 2 cột mới thêm
            await db.execute(
                'INSERT INTO users (fullname, email, password, otp_code, is_verified) VALUES (?, ?, ?, ?, false)',
                [fullname, email, hashedPassword, otpCode]
            );

            // 6. Gửi email chứa mã OTP
            const subject = 'Xác thực tài khoản PHENIKAA AUCTION';
            const textContent = `Chào ${fullname},\n\nMã OTP xác thực tài khoản của bạn là: ${otpCode}.\nVui lòng nhập mã này trên website để hoàn tất đăng ký.\nKhông chia sẻ mã này cho bất kỳ ai.\n\nTrân trọng,\nĐội ngũ Phenikaa Auction.`;
            
            await sendEmail(email, subject, textContent);
            
            res.status(201).json({ success: true, message: 'Đã gửi mã OTP! Vui lòng kiểm tra email.' });
        } catch (error) {
            console.error("Lỗi Controller Đăng Ký:", error);
            res.status(500).json({ success: false, message: 'Lỗi server nội bộ!' });
        }
    },

    verifyOtp: async (req, res) => {
        try {
            const { email, otp } = req.body;

            // 1. Tìm user có email và mã OTP khớp nhau
            const [users] = await db.execute('SELECT * FROM users WHERE email = ? AND otp_code = ?', [email, otp]);
            
            if (users.length === 0) {
                return res.status(400).json({ success: false, message: 'Mã OTP không chính xác hoặc đã hết hạn!' });
            }

            // 2. Cập nhật trạng thái thành "Đã xác thực" và xóa mã OTP đi cho an toàn
            await db.execute('UPDATE users SET is_verified = true, otp_code = NULL WHERE email = ?', [email]);
            
            res.status(200).json({ success: true, message: 'Xác thực thành công! Bạn có thể đăng nhập ngay bây giờ.' });
        } catch (error) {
            console.error("Lỗi Controller Xác Thực OTP:", error);
            res.status(500).json({ success: false, message: 'Lỗi server nội bộ!' });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            // 1. Tìm user theo email
            const user = await UserModel.findByEmail(email);
            if (!user) {
                return res.status(404).json({ success: false, message: 'Tài khoản không tồn tại!' });
            }

            // 2. BỨC TƯỜNG LỬA BẢO VỆ: Check xem đã xác thực email chưa?
            if (!user.is_verified) {
                return res.status(403).json({ success: false, message: 'Tài khoản chưa xác thực email. Vui lòng kiểm tra hòm thư!' });
            }

            // 3. Giải mã và So khớp password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ success: false, message: 'Sai mật khẩu!' });
            }

            // 4. Ký Token (Giấy thông hành) cho Frontend
            const token = jwt.sign(
                { id: user.id, role: user.role, fullname: user.fullname },
                process.env.JWT_SECRET || 'secret_key_tam_thoi', 
                { expiresIn: '1d' } 
            );

            // Xóa pass khỏi object trước khi gửi về Frontend để bảo mật
            delete user.password;

            res.status(200).json({
                success: true,
                message: 'Đăng nhập thành công!',
                token: token,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role 
                }
            });
        } catch (error) {
            console.error("Lỗi Controller Đăng Nhập:", error);
            res.status(500).json({ success: false, message: 'Lỗi server nội bộ!' });
        }
    }
};

module.exports = AuthController;