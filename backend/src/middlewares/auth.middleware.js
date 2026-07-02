const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Truy cập bị từ chối. Không tìm thấy Token!' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; 
        next();
    } catch (error) {
        res.status(403).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn!' });
    }
};

const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role === 'ADMIN') {
            next();
        } else {
            res.status(403).json({ success: false, message: 'Yêu cầu quyền Quản trị viên!' });
        }
    });
};

module.exports = { verifyToken, verifyAdmin };