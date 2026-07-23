const express = require('express');
const router = express.Router();
const WishlistController = require('../controllers/wishlist.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.get('/', verifyToken, WishlistController.getMyWishlist);
router.get('/ids', verifyToken, WishlistController.getMyWishlistIds);
router.post('/:assetId', verifyToken, WishlistController.addToWishlist);
router.delete('/:assetId', verifyToken, WishlistController.removeFromWishlist);

module.exports = router;