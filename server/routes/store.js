const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const authMiddleware = require('../middlewares/authMiddleware');

// 상품 목록 조회
router.get('/product-list', authMiddleware, storeController.getProductList);

module.exports = router;