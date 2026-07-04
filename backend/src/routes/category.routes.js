const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/category.controller');
const { verifyToken, verifyAdmin } = require('../middlewares/auth.middleware');

// Public API
router.get('/', CategoryController.getAll);

// Protected API (Chỉ Admin)
router.post('/', verifyAdmin, CategoryController.create);

module.exports = router;