const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Lấy thông tin cá nhân 
router.get('/profile', verifyToken, UserController.getProfile);

module.exports = router;