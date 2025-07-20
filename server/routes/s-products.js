// server/routes/s-products.js
const express = require('express');
const path = require('path');
const router = express.Router();
const { Product } = require('../models');

// cloudinary
const multer = require('multer');
const { storage } = require('../modules/cloudinary');
const upload = multer({ storage });

const { ProductImg } = require('../models');

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

// 이미지 업로드 및 DB 저장
router.post('/:productId/images', upload.array('images', 5), async (req, res) => {
  const productId = req.params.productId;

  try {
    const imageUrls = req.files.map(file => file.path);
    console.log('업로드된 이미지 URL:', imageUrls);

    for (let i = 0; i < imageUrls.length; i++) {
      await ProductImg.create({
        product_id: productId,
        img_url: imageUrls[i],
        img_order: i + 1,
        created_at: new Date(),
      });
    }

    res.status(200).json({
      message: '이미지 업로드 및 저장 완료',
      urls: imageUrls
    });
  } catch (err) {
    console.error('이미지 업로드 실패:', err);
    res.status(500).json({ message: '업로드 실패', error: err.message });
  }
});

module.exports = router;