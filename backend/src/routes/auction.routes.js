const express = require('express');
const router = express.Router();
const AuctionController = require('../controllers/auction.controller');
const { verifyAdmin } = require('../middlewares/auth.middleware');

router.post('/', verifyAdmin, AuctionController.createSession);

module.exports = router;