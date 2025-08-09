const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middlewares/authMiddleware');
const { getFavoriteStores, getProductWishlists } = require('../../controllers/mypage-buyer/wishlistController');

// 스토어 즐겨찾기 목록 조회
router.get('/favorites', authMiddleware, getFavoriteStores);

// 상품 찜 목록 조회
router.get('/wishlists', authMiddleware, getProductWishlists);

module.exports = router;