const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, sellerController.getSellerInfo);       // 판매자 정보 조회
router.patch('/', authMiddleware, sellerController.patchSellerInfo);   // 판매자 정보 수정

module.exports = router;