const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// 카테고리 목록 조회
router.get('/', categoryController.getCategories);

module.exports = router;