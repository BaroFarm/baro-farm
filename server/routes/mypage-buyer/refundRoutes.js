const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/authMiddleware');
const { getMyCancellations, getCancellationDetail } = require('../../controllers/mypage-buyer/refundController');

// 취소/반품 내역 조회
router.get('/', authMiddleware, getMyCancellations);

// 취소/반품 내역 상세 조회
router.get('/:refund_id', authMiddleware, getCancellationDetail);

module.exports = router;