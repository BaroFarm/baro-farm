const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const productController = require('../controllers/main/productController');
const reviewController = require('../controllers/main/reviewController'); 
const { getSeasonalProducts } = require('../controllers/main/SeasonalController');

// 상품 목록
router.get('/',  productController.getProducts);

// 제철 상품 조회 
router.get('/seasonal', getSeasonalProducts);

// 상품 상세
router.get('/:product_id', productController.getProductDetail);

// 상품 리뷰 목록 조회
router.get('/:product_id/reviews', reviewController.getProductReviews); 

// 상품 리뷰 작성
router.post('/:product_id/reviews', authMiddleware, async (req, res, next) => {
    req.body.product_id = req.params.product_id;
    return reviewController.createReview(req, res, next);
});

module.exports = router;