const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');
const sendEmail = require('../utils/sendEmail');
const db = require('../config/db');

const AuthController = {
    register: async (req, res) => {
        try {
            const { fullname, email, password } = req.body;
            
            if (!fullname || !email || !password) {
                return res.status(400).json({ success: false, message: 'Vui lòng nhập đủ thông tin!' });
            }

            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!passwordRegex.test(password)) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Mật khẩu phải từ 8 ký tự, gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt!' 
                });
            }

            const existingUser = await UserModel.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'Email đã được sử dụng!' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

            const [result] = await db.execute(
                'INSERT INTO users (fullname, email, password, otp_code, is_verified) VALUES (?, ?, ?, ?, false)',
                [fullname, email, hashedPassword, otpCode]
            );

            const subject = 'Xác thực tài khoản PHENIKAA AUCTION';
            const textContent = `Chào ${fullname},\n\nMã OTP xác thực tài khoản của bạn là: ${otpCode}.`;
            
            const isEmailSent = await sendEmail(email, subject, textContent);

            if (!isEmailSent) {
                await db.execute('DELETE FROM users WHERE id = ?', [result.insertId]);
                return res.status(500).json({ success: false, message: 'Hệ thống gửi Mail đang bận, vui lòng thử lại sau!' });
            }
            
            res.status(201).json({ success: true, message: 'Đã gửi mã OTP! Vui lòng kiểm tra email.' });
        } catch (error) {
            console.error("Lỗi Controller Đăng Ký:", error);
            res.status(500).json({ success: false, message: 'Lỗi server nội bộ!' });
        }
    },

    verifyOtp: async (req, res) => {
        try {
            const { email, otp } = req.body;
            const [users] = await db.execute('SELECT * FROM users WHERE email = ? AND otp_code = ?', [email, otp]);
            
            if (users.length === 0) {
                return res.status(400).json({ success: false, message: 'Mã OTP không chính xác hoặc đã hết hạn!' });
            }

            await db.execute('UPDATE users SET is_verified = true, otp_code = NULL WHERE email = ?', [email]);
            res.status(200).json({ success: true, message: 'Xác thực thành công! Bạn có thể đăng nhập ngay.' });
        } catch (error) {
            console.error("Lỗi Controller Xác Thực OTP:", error);
            res.status(500).json({ success: false, message: 'Lỗi server nội bộ!' });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await UserModel.findByEmail(email);
            if (!user) return res.status(404).json({ success: false, message: 'Tài khoản không tồn tại!' });
            
            if (!user.is_verified) return res.status(403).json({ success: false, message: 'Tài khoản chưa xác thực email!' });

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).json({ success: false, message: 'Sai mật khẩu!' });

            const token = jwt.sign(
                { id: user.id, role: user.role, fullname: user.fullname },
                process.env.JWT_SECRET || 'secret_key_tam_thoi', 
                { expiresIn: '1d' } 
            );

            res.status(200).json({
                success: true, message: 'Đăng nhập thành công!', token: token,
                user: { id: user.id, email: user.email, role: user.role }
            });
        } catch (error) {
            console.error("Lỗi Controller Đăng Nhập:", error);
            res.status(500).json({ success: false, message: 'Lỗi server nội bộ!' });
        }
    },

    forgotPassword: async (req, res) => {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ success: false, message: 'Vui lòng nhập email!' });
            }

            const user = await UserModel.findByEmail(email);
            // Không tiết lộ email có tồn tại hay không, tránh lộ thông tin tài khoản
            if (!user) {
                return res.status(200).json({ success: true, message: 'Nếu email tồn tại, mã OTP đặt lại mật khẩu đã được gửi!' });
            }

            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
            await db.execute(
                'UPDATE users SET reset_otp = ?, reset_otp_expires = DATE_ADD(NOW(), INTERVAL 10 MINUTE) WHERE email = ?',
                [otpCode, email]
            );

            const subject = 'Đặt lại mật khẩu PHENIKAA AUCTION';
            const textContent = `Chào ${user.fullname},\n\nMã OTP để đặt lại mật khẩu của bạn là: ${otpCode}.\nMã có hiệu lực trong 10 phút.`;
            await sendEmail(email, subject, textContent);

            res.status(200).json({ success: true, message: 'Nếu email tồn tại, mã OTP đặt lại mật khẩu đã được gửi!' });
        } catch (error) {
            console.error("Lỗi Controller Quên Mật Khẩu:", error);
            res.status(500).json({ success: false, message: 'Lỗi server nội bộ!' });
        }
    },

    resetPassword: async (req, res) => {
        try {
            const { email, otp, newPassword } = req.body;
            if (!email || !otp || !newPassword) {
                return res.status(400).json({ success: false, message: 'Vui lòng nhập đủ thông tin!' });
            }

            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!passwordRegex.test(newPassword)) {
                return res.status(400).json({
                    success: false,
                    message: 'Mật khẩu phải từ 8 ký tự, gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt!'
                });
            }

            const [users] = await db.execute(
                'SELECT * FROM users WHERE email = ? AND reset_otp = ? AND reset_otp_expires > NOW()',
                [email, otp]
            );

            if (users.length === 0) {
                return res.status(400).json({ success: false, message: 'Mã OTP không đúng hoặc đã hết hạn!' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            await db.execute(
                'UPDATE users SET password = ?, reset_otp = NULL, reset_otp_expires = NULL WHERE email = ?',
                [hashedPassword, email]
            );

            res.status(200).json({ success: true, message: 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay.' });
        } catch (error) {
            console.error("Lỗi Controller Đặt Lại Mật Khẩu:", error);
            res.status(500).json({ success: false, message: 'Lỗi server nội bộ!' });
        }
    }
};

module.exports = AuthController;