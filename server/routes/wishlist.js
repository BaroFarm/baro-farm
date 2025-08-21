// server/routes/wishlist.routes.js
const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/main/wishlistController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// 찜하기 
router.post('/', authMiddleware, wishlistController.addToWishlist);

module.exports = router;