const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const authRoutes = require('./authRoutes'); 
const mypageRoutes = require('./mypage-buyer') // 구매자 마이페이지

router.use('/auth', authRoutes);

router.use('/my', mypageRoutes);

router.get('/', (req, res) => {
    res.send('Hello, Express');
});

module.exports = router;