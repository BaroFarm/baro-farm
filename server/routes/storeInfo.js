const express = require('express');
const router = express.Router();
const storeInfoController = require('../controllers/storeInfoController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// 테스트용: 인증 미들웨어 생략
router.get('/', authMiddleware, storeInfoController.getStoreInfo);       // 스토어 정보 조회
router.patch('/', authMiddleware, storeInfoController.patchStoreInfo);   // 스토어 정보 수정

module.exports = router;