const express = require('express');
const router = express.Router();

const sProductsRouter = require('./s-products');
// 다른 라우터가 있으면 여기에 추가: const authRoutes = require('./auth'); 등

router.get('/health', (req, res) => res.json({ ok: true }));

router.use('/s-products', sProductsRouter);
// router.use('/auth', authRoutes);  // ← authRoutes가 "유효한 라우터"를 export할 때만 사용

module.exports = router; // ✅ 반드시 router를 export
