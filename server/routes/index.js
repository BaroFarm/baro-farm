const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const authRoutes = require('./authRoutes'); 
const categoryRoutes = require('./categoryRoutes');

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);

router.get('/', (req, res) => {
    res.send('Hello, Express');
});

module.exports = router;