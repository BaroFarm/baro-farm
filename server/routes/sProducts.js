// server/routes/s-products.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const controller = require('../controllers/sProduct');
const upload = require('../middlewares/imgUpload');

// 상품 기본 정보
router.post('/basic', authMiddleware,controller.postBasicInfo);

// 이미지 등록
router.post('/:productId/images', authMiddleware, upload.array('images', 5), controller.uploadImages);

// AI 상세 설명 생성 및 저장
router.post('/:productId/description/ai-gen', authMiddleware, controller.generateAIDescription);
router.post('/:productId/description/ai-save', authMiddleware, controller.saveAIDescription);

// 상세 설명 직접 작성 및 저장
router.post('/:productId/description/manual', authMiddleware, controller.saveManualDescription);

// AI 상세 설명 요약 및 저장
router.get('/:productId/description/summary', authMiddleware, controller.getSummaryDescription);
router.post('/:productId/description/summary-save', authMiddleware, controller.saveSummaryToIntro);

// AI 영상 생성 (지금은 AI 영상 조회)
router.get('/:productId/video-gen', authMiddleware, controller.getProductVideo);

// AI 상세 페이지 생성 및 저장
router.get('/:productId/preview', authMiddleware, controller.getFigmaSpec);
router.post(
    '/:productId/submit',
    upload.single('file'),
    authMiddleware,
    controller.saveFigmaExport
  );

module.exports = router;