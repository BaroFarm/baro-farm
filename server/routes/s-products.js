// server/routes/s-products.js
const express = require('express');
const path = require('path');
const router = express.Router();
const { Product } = require('../models');

// 상품 기본 정보 저장 (불필요한 필드 유출 방지 위해 아래 항목 씀)
router.get('/basic', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/basic.html'));
});

router.post('/basic', async (req, res) => {
  try {
    const {
      title,
      category_id,
      seller_id,
      direct_store_id,
      status,
      weight,
      price,
      description,
      intro,
      is_video,
      video_url,
      created_at,
      returnable
    } = req.body;

    const newProduct = await Product.create({
      title,
      category_id,
      seller_id,
      direct_store_id,
      status,
      weight,
      price,
      description,
      intro,
      is_video,
      video_url,
      created_at,
      updated_at: null,
      returnable
    });

    res.status(201).json({ product: newProduct });
  } catch (err) {
    console.error('상품 등록 오류:', err);
    res.status(500).json({ error: '상품 등록 실패', details: err.message });
  }
});

// 이미지 등록
router.get('/:productId/images', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/images.html'));
});

module.exports = router;