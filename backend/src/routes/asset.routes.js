const express = require('express');
const router = express.Router();
const AssetController = require('../controllers/asset.controller');
const { verifyToken, verifyAdmin } = require('../middlewares/auth.middleware');

// Public API
router.get('/', AssetController.getApprovedAssets);

// User API (Cần Login)
router.post('/', verifyToken, AssetController.createAsset);

// Admin API (Cần quyền Admin)
router.put('/:id/status', verifyAdmin, AssetController.approveAsset);

module.exports = router;