const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/authMiddleware');
const { getProfile, updateProfile } = require('../../controllers/mypage-buyer/profileController');

// 프로필 조회
router.get('/', authMiddleware, getProfile);

// 프로필 수정
router.patch('/', authMiddleware, updateProfile);

module.exports = router;