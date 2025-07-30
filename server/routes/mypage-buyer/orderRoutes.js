const express = require('express');
const router = express.Router();
const { getMyOrders, getMyOrderDetail } = require('../../controllers/mypage-buyer/orderController');
const authMiddleware = require('../../middlewares/authMiddleware');

router.get('/', authMiddleware, getMyOrders);
router.get('/:order_id', authMiddleware, getMyOrderDetail);

module.exports = router;
