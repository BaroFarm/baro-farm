const express = require('express');
const router = express.Router();
const { getDownloadableCoupons, getMyCoupons, downloadCoupon } = require('../../controllers/mypage-buyer/couponController');
const authMiddleware = require('../../middlewares/authMiddleware');

router.get('/downloadable', authMiddleware, getDownloadableCoupons); // 다운로드 가능한 쿠폰 목록 조회
router.get('/', authMiddleware, getMyCoupons); // 보유 쿠폰 목록 조회
router.post('/', authMiddleware, downloadCoupon); // 쿠폰 다운로드

module.exports = router;
