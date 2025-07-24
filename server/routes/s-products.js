// server/routes/s-products.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/sProductController');
const upload = require('../middlewares/upload');

// 상품 기본 정보
router.get('/basic', controller.getBasicPage);
router.post('/basic', controller.postBasicInfo);

// 이미지 등록
router.get('/:productId/images', controller.getImagesPage);
router.post('/:productId/images', upload.array('images', 5), controller.uploadImages);

// AI 설명 생성 및 저장
router.get('/:productId/description/ai-gen', controller.getAIGenPage);
router.post('/:productId/description/ai-gen', controller.generateAIDescription);
router.get('/:productId/description/summary', controller.getSummaryPage);
router.post('/:productId/description/ai-save', controller.saveAIDescription);

module.exports = router;