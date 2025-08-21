const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const mainStoreController = require('../controllers/main/storeController');
const { authMiddleware, optionalAuth } = require('../middlewares/authMiddleware');

// 상품 목록 조회
router.get('/product-list', authMiddleware, storeController.getProductList);

// 상품 삭제
router.delete('/product-list/:product_id', authMiddleware, storeController.deleteProduct);

// 상품 정보 조회
router.get('/product/:product_id', authMiddleware, storeController.getProductDetail);

// 상품 정보 수정
router.patch('/product/:product_id', authMiddleware, storeController.updateProduct);

// 직매장 상세 조회 
router.get('/:store_id', authMiddleware, mainStoreController.getStoreDetail);

module.exports = router;