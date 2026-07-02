const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');

const AuthController = {
    register: async (req, res) => {
        try {
            const { fullname, email, password } = req.body;
            
            // Validate sơ bộ
            if (!fullname || !email || !password) {
                return res.status(400).json({ success: false, message: 'Vui lòng nhập đủ thông tin!' });
            }

            // Check email tồn tại
            const existingUser = await UserModel.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'Email đã được sử dụng!' });
            }

            // Băm pass
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            await UserModel.create({ fullname, email, password: hashedPassword });
            
            res.status(201).json({ success: true, message: 'Đăng ký thành công!' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server!' });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            const user = await UserModel.findByEmail(email);
            if (!user) {
                return res.status(404).json({ success: false, message: 'Tài khoản không tồn tại!' });
            }

            // So khớp pass
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ success: false, message: 'Sai mật khẩu!' });
            }

            // Ký Token
            const token = jwt.sign(
                { id: user.id, role: user.role, fullname: user.fullname },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );

            // Xóa pass khỏi data trả về
            delete user.password;

            res.status(200).json({ success: true, message: 'Đăng nhập thành công!', token, user });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server!' });
        }
    }
};

module.exports = AuthController;