// server/routes/s-products.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const controller = require('../controllers/sProduct');
const upload = require('../middlewares/imgUpload');

// 상품 기본 정보
router.post('/basic', authMiddleware,controller.postBasicInfo);

// 이미지 등록
router.post('/:productId/images', authMiddleware, upload.array('images', 5), controller.uploadImages);

// // AI 상세 설명 생성 및 저장
router.post('/:productId/description/ai-gen', authMiddleware, controller.generateAIDescription);
router.post('/:productId/description/ai-save', authMiddleware, controller.saveAIDescription);

// // 상세 설명 직접 작성 및 저장
// router.get('/:productId/description/manual', controller.getManualPage);
// router.post('/:productId/description/manual', controller.saveManualDescription);

// // AI 상세 설명 요약
// router.get('/:productId/description/summary', controller.getSummaryDescription);
// router.post('/:productId/description/summary-save', controller.saveSummaryToIntro);

module.exports = router;