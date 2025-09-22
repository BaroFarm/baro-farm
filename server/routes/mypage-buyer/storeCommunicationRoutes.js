// 직매장 소통 채널
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middlewares/authMiddleware');
const { createInquiry, getInquiries } = require('../../controllers/mypage-buyer/inquiryController');

// 문의 게시판 - 문의 게시
router.post('/inquiries', authMiddleware, createInquiry);

// 문의 게시판 - 문의 내역 조회
router.get('/inquiries', authMiddleware, getInquiries);

module.exports = router;
