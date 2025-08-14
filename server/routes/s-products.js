const express = require('express');
const multer = require('multer');
const upload = multer(); // 메모리에 저장 (파일 업로드 X, 필드만 받음)
const router = express.Router();
const { ProductImage } = require('../models');

/**
 * 상품 기본정보 등록
 */
router.post('/basic', upload.none(), async (req, res) => {
  try {
    const { title, weight, category_id, price, direct_store_id, returnable } = req.body;

    const toInt = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : NaN;
    };

    const errors = [];
    if (!title || typeof title !== 'string' || !title.trim()) errors.push('title');
    if (!Number.isFinite(toInt(weight))) errors.push('weight');
    if (!Number.isFinite(toInt(category_id))) errors.push('category_id');
    if (!Number.isFinite(toInt(price))) errors.push('price');
    if (!Number.isFinite(toInt(direct_store_id))) errors.push('direct_store_id');
    if (typeof JSON.parse(returnable) !== 'boolean') errors.push('returnable'); // 문자열로 올 가능성 대비

    if (errors.length) {
      return res.status(400).json({ status: 'error', message: `필수 필드 오류: ${errors.join(', ')}`, code: 400 });
    }

    return res.json({
      product_id: 1, // 실제 생성 시 DB 저장 후 ID 반환하도록 수정 필요
      title: title.trim(),
      weight: toInt(weight),
      category_id: toInt(category_id),
      price: toInt(price),
      direct_store_id: toInt(direct_store_id),
      returnable: JSON.parse(returnable),
    });
  } catch (e) {
    console.error('[ERR] /basic', e);
    return res.status(500).json({ status: 'error', message: e.message || '상품 등록 실패', code: 500 });
  }
});

/**
 * 상품 이미지 등록
 */
router.post('/:productId/images', upload.none(), async (req, res) => {
  try {
    const pid = Number(req.params.productId);
    const { img_id, img_url, img_order } = req.body;

    if (!Number.isInteger(pid) || pid <= 0) {
      return res.status(400).json({ status: 'error', message: '유효하지 않은 productId입니다.', code: 400 });
    }
    if (!img_id || typeof img_id !== 'string' || !img_id.trim()) {
      return res.status(400).json({ status: 'error', message: 'img_id는 필수 문자열입니다.', code: 400 });
    }
    if (!img_url || typeof img_url !== 'string' || !img_url.trim()) {
      return res.status(400).json({ status: 'error', message: 'img_url은 필수 문자열입니다.', code: 400 });
    }

    const order = Number(img_order) || 1;

    const created = await ProductImage.create({
      product_id: pid,
      img_id: img_id.trim(),
      img_url: img_url.trim(),
      img_order: order,
    });

    const images = await ProductImage.findAll({
      where: { product_id: pid },
      order: [['img_order', 'ASC'], ['id', 'ASC']],
    });

    return res.json({ status: 'success', product_id: pid, created, images });
  } catch (e) {
    console.error('[ERR] POST /:productId/images', e);
    return res.status(500).json({
      status: 'error',
      message: process.env.NODE_ENV === 'production' ? '이미지 등록 실패' : (e.message || '이미지 등록 실패'),
      code: 500,
    });
  }
});

module.exports = router;
