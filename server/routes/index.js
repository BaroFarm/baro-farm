const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const authRoutes = require('./authRoutes'); 
const mypageRoutes = require('./mypage-buyer') // 구매자 마이페이지
const sellerRoutes = require('./seller'); // 판매자 정보 조회

router.use('/auth', authRoutes);

router.use('/my', mypageRoutes);

router.use('/seller', sellerRoutes);

router.get('/', (req, res) => {
    res.send('Hello, Express');
});

module.exports = router;