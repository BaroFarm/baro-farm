const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// 상품 목록 조회
router.get('/product-list', authMiddleware, storeController.getProductList);

// 상품 삭제
router.delete('/product-list/:product_id', authMiddleware, storeController.deleteProduct);

// 상품 정보 조회
router.get('/product/:product_id', authMiddleware, storeController.getProductDetail);

// 상품 정보 수정
router.patch('/product/:product_id', authMiddleware, storeController.updateProduct);

module.exports = router;