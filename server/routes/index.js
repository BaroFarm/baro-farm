// routes/index.js
const express = require('express');
const router = express.Router();

// ✅ 인증 관련 라우트
try {
  const authRoutes = require('./authRoutes');
  router.use('/auth', authRoutes);
} catch (e) {
  console.warn('⚠ authRoutes 불러오기 실패:', e.message);
}

// ✅ 상품 관련 라우트
const sProductsRouter = require('./s-products');
router.use('/s-products', sProductsRouter);

module.exports = router;
