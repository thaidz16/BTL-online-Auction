const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const { verifyToken, verifyAdmin } = require('../middlewares/auth.middleware');

// Lấy thông tin cá nhân 
router.get('/profile', verifyToken, UserController.getProfile);
router.get('/admin/pending-deposits', verifyAdmin, UserController.getPendingDeposits);
router.post('/admin/approve-deposit', verifyAdmin, UserController.approveDeposit);

module.exports = router;