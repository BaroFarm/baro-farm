const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middlewares/authMiddleware');
const getMyVouchers = require('../../controllers/mypage-buyer/voucherController');

// 보유 금액권 목록 조회
router.get('/', authMiddleware, getMyVouchers);

module.exports = router;