// routes/s-products.js
const express = require('express');
const router = express.Router();
const { ProductImage } = require('../models'); // models/index.js에서 export된 모델

/* ==========================
   상품 기본정보 등록
   POST /api/s-products/basic
========================== */
router.post('/basic', async (req, res) => {
  try {
    const { title, weight, category_id, price, direct_store_id, returnable } = req.body;

    // 간단 검증 함수
    const toInt = (v) => (Number.isFinite(Number(v)) ? Number(v) : NaN);
    const errors = [];
    if (!title || typeof title !== 'string' || !title.trim()) errors.push('title');
    if (!Number.isFinite(toInt(weight))) errors.push('weight');
    if (!Number.isFinite(toInt(category_id))) errors.push('category_id');
    if (!Number.isFinite(toInt(price))) errors.push('price');
    if (!Number.isFinite(toInt(direct_store_id))) errors.push('direct_store_id');
    if (typeof returnable !== 'boolean') errors.push('returnable');

    if (errors.length) {
      return res.status(400).json({
        status: 'error',
        message: `필수 필드 오류: ${errors.join(', ')}`,
        code: 400,
      });
    }

    // TODO: 여기서 실제 DB 저장 로직 (예: Sequelize)
    // const created = await Product.create({ ... });

    // 임시 성공 응답 (프론트 흐름 테스트용)
    return res.json({
      product_id: 1,
      title: title.trim(),
      weight: toInt(weight),
      category_id: toInt(category_id),
      price: toInt(price),
      direct_store_id: toInt(direct_store_id),
      returnable,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: 'error',
      message: '상품 등록 실패',
      code: 500,
    });
  }
});

/* ==========================
   상품 이미지 등록
   POST /api/s-products/:productId/images
========================== */
router.post('/:productId/images', async (req, res) => {
  try {
    const { productId } = req.params;
    const { img_id, img_url, img_order, created_at } = req.body;

    console.log('[이미지 등록 요청]', req.body);

    if (!img_id || !img_url) {
      return res.status(400).json({
        status: 'error',
        message: 'img_id, img_url은 필수입니다.',
        code: 400,
      });
    }

    // DB 저장
    await ProductImage.create({
      product_id: Number(productId),
      img_id,
      img_url,
      img_order: img_order ?? 1,
      created_at: created_at ? new Date(created_at) : new Date(),
    });

    // 현재 상품의 모든 이미지 목록 조회
    const images = await ProductImage.findAll({
      where: { product_id: Number(productId) },
      order: [['img_order', 'ASC']],
    });

    // 응답
    return res.json({
      product_id: Number(productId),
      images,
    });

  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: 'error',
      message: '이미지 등록 실패',
      code: 500,
    });
  }
});

module.exports = router;
