const express = require('express');
const router = express.Router();
const AssetController = require('../controllers/asset.controller');
const { verifyToken, verifyAdmin } = require('../middlewares/auth.middleware');

router.get('/', AssetController.getApprovedAssets);
router.post('/', verifyToken, AssetController.createAsset);
router.get('/pending', verifyAdmin, AssetController.getPendingAssets);
router.get('/:id', AssetController.getAssetById);
router.put('/:id/status', verifyAdmin, AssetController.approveAsset);

module.exports = router;