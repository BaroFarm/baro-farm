const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const authRoutes = require('./authRoutes'); // 사용자 인증
const mypageRoutes = require('./mypage-buyer') // 마이페이지
const recommendRoutes = require('./recommendRoutes'); // 상품 추천

const sellerRoutes = require('./seller'); // 판매자 정보 조회 및 변경
const storeInfoRoutes = require('./storeInfo'); // 스토어 정보 조회 및 변경
const storeRoutes = require('./store'); // 스토어와 스토어 내 상품 관리
const sProductsRoutes = require('./sProducts'); // 판매자 상품 등록

const productInquiryRoutes = require('./productInquiryRoutes'); // 상품 문의 내역 조회

const categoryRoutes = require('./category');

router.use('/auth', authRoutes);

router.use('/my', mypageRoutes);

router.use('/', recommendRoutes); 

router.use('/seller', sellerRoutes);

router.use('/store', storeInfoRoutes);

router.use('/store', storeRoutes);

router.use('/s-products', sProductsRoutes);

router.use('/categories', categoryRoutes);

router.use('/products', productInquiryRoutes);


router.get('/', (req, res) => {
    res.send('Hello, Express');
});

module.exports = router;