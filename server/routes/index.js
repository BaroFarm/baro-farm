const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const authRoutes = require('./authRoutes'); 
const mypageRoutes = require('./mypage-buyer') 
const recommendRoutes = require('./recommendRoutes');

router.use('/auth', authRoutes);

router.use('/my', mypageRoutes);

router.use('/', recommendRoutes); //

router.get('/', (req, res) => {
    res.send('Hello, Express');
});

module.exports = router;