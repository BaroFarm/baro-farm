const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const authRoutes = require('./authRoutes'); 

router.use('/auth', authRoutes);


router.get('/', (req, res) => {
    res.send('Hello, Express');
});

module.exports = router;