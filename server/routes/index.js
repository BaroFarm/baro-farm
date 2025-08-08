const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const authRoutes = require('./authRoutes'); 
const mypageRoutes = require('./mypage-buyer') // 구매자 마이페이지
const sellerRoutes = require('./seller'); // 판매자 정보 조회 및 변경
const storeInfoRoutes = require('./storeInfo'); // 스토어 정보 조회 및 변경
const storeRoutes = require('./store'); // 스토어와 스토어 내 상품 관리
const sProductsRoutes = require('./sProducts'); // 판매자 상품 등록

router.use('/auth', authRoutes);

router.use('/my', mypageRoutes);

router.use('/seller', sellerRoutes);

router.use('/store', storeInfoRoutes);

router.use('/store', storeRoutes);

router.use('/s-products', sProductsRoutes);

router.get('/', (req, res) => {
    res.send('Hello, Express');
});

module.exports = router;