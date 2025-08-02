const express = require('express');
const router = express.Router();
const { recommendProducts } = require('../controllers/recommendController');
const { authMiddleware, optionalAuth } = require('../middlewares/authMiddleware');
// 비로그인자도 사용 가능해야 하므로 authMiddleware 대신 optionalAuth 적용

router.get('/products/recommend', optionalAuth, recommendProducts); //

module.exports = router;