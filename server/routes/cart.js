const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const cartController = require('../controllers/cartController');

// 장바구니 담기
router.post('/', authMiddleware, cartController.addToCart);
// 장바구니 조회
router.get('/', authMiddleware, cartController.getCart);
// 장바구니 삭제
router.delete('/:cart_item_id', authMiddleware, cartController.removeFromCart);

module.exports = router;