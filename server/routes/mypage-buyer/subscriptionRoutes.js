const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middlewares/authMiddleware');
const { getMySubscriptions } = require('../../controllers/mypage-buyer/subscriptionController');

// 나의 정기배송 내역 조회
router.get('/', authMiddleware, getMySubscriptions);

module.exports = router;
