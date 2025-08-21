const express = require('express');
const router = express.Router();
const getProductInquiries = require('../controllers/productInquiryController');
const { authMiddleware, optionalAuth } = require('../middlewares/authMiddleware');

router.get('/:product_id/inquiries', optionalAuth, getProductInquiries); // 상품 문의 내역 조회

module.exports = router;