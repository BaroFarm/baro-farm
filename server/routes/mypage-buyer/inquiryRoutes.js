const express = require('express');
const router = express.Router();
const { getMyInquiries } = require('../../controllers/mypage-buyer/inquiryController');
const { authMiddleware } = require('../../middlewares/authMiddleware');

router.get('/', authMiddleware, getMyInquiries); // 나의 문의내역 조회

module.exports = router;
