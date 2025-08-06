const express = require('express');
const router = express.Router();

const profileRoutes = require('./profileRoutes'); // 프로필 조회/수정
router.use('/profile', profileRoutes);

const orderRoutes = require('./orderRoutes'); // 주문/배송 내역 조회
router.use('/orders', orderRoutes);

const refundRoutes = require('./refundRoutes'); // 취소/반품 내역 조회
router.use('/cancel', refundRoutes);

const wishlistRoutes = require('./wishlistRoutes'); // 스토어 즐겨찾기, 상품 찜 목록 조회
router.use('/', wishlistRoutes);

const reviewRoutes = require('./reviewRoutes'); // 리뷰 내역 조회
router.use('/reviews', reviewRoutes);

const voucherRoutes = require('./voucherRoutes'); // 보유 금액권 목록 조회
router.use('/vouchers', voucherRoutes);

const couponRoutes = require('./couponRoutes'); // 다운로드 가능한 쿠폰 조회, 보유 쿠폰 조회, 쿠폰 다운로드
router.use('/coupons', couponRoutes);

const inquiryRoutes = require('./inquiryRoutes'); // 문의 내역 조회
router.use('/inquiries', inquiryRoutes);

module.exports = router;

