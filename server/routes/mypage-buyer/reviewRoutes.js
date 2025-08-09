const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middlewares/authMiddleware');
const { getMyReviews } = require('../../controllers/mypage-buyer/reviewController');

// 리뷰 내역 조회
router.get('/', authMiddleware, getMyReviews);

module.exports = router;