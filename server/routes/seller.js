const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');

router.get('/', sellerController.getSellerInfo);       // 판매자 정보 조회
router.patch('/', sellerController.patchSellerInfo);   // 판매자 정보 수정

module.exports = router;