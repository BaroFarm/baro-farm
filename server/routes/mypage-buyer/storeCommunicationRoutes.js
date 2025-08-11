// 직매장 소통 채널
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middlewares/authMiddleware');
const { createInquiry } = require('../../controllers/mypage-buyer/inquiryController');

// 직매장 소통 채널 문의 작성
router.post('/inquiries', authMiddleware, createInquiry);

module.exports = router;
