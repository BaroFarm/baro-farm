// server/routes/s-products.js
const express = require('express');
const multer = require('multer');
const upload = multer(); // multipart/form-data 처리(메모리 저장)
const router = express.Router();
const { ProductImage } = require('../models');

/**
 * 상품 기본정보 등록
 * POST /api/s-products/basic
 * Body: FormData | JSON
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

    // returnable은 문자열/불리언 모두 수용
    let returnableBool;
    if (typeof returnable === 'boolean') {
      returnableBool = returnable;
    } else if (typeof returnable === 'string') {
      try {
        const parsed = JSON.parse(returnable);
        returnableBool = typeof parsed === 'boolean' ? parsed : null;
      } catch {
        returnableBool = null;
      }
    }
    if (typeof returnableBool !== 'boolean') errors.push('returnable');

    if (errors.length) {
      return res
        .status(400)
        .json({ status: 'error', message: `필수 필드 오류: ${errors.join(', ')}`, code: 400 });
    }

    // TODO: 실제 DB 저장 후 생성된 product_id 반환하도록 변경
    return res.json({
      product_id: 1, // 임시값
      title: title.trim(),
      weight: toInt(weight),
      category_id: toInt(category_id),
      price: toInt(price),
      direct_store_id: toInt(direct_store_id),
      returnable: returnableBool,
    });
  } catch (e) {
    console.error('[ERR] /basic', e);
    return res
      .status(500)
      .json({ status: 'error', message: e.message || '상품 등록 실패', code: 500 });
  }
});

/**
 * 상품 이미지 등록
 * POST /api/s-products/:productId/images
 * Body: FormData(img_id, img_url, img_order?)
 */
router.post('/:productId/images', upload.none(), async (req, res) => {
  try {
    const pid = Number(req.params.productId);
    const { img_id, img_url, img_order } = req.body;

    if (!Number.isInteger(pid) || pid <= 0) {
      return res
        .status(400)
        .json({ status: 'error', message: '유효하지 않은 productId입니다.', code: 400 });
    }
    if (!img_id || typeof img_id !== 'string' || !img_id.trim()) {
      return res
        .status(400)
        .json({ status: 'error', message: 'img_id는 필수 문자열입니다.', code: 400 });
    }
    if (!img_url || typeof img_url !== 'string' || !img_url.trim()) {
      return res
        .status(400)
        .json({ status: 'error', message: 'img_url은 필수 문자열입니다.', code: 400 });
    }

    const order = Number(img_order) || 1;

    // 저장 (Sequelize 모델에 따라 createdAt/updatedAt 또는 created_at/updated_at 사용)
    const created = await ProductImage.create({
      product_id: pid,
      img_id: img_id.trim(),
      img_url: img_url.trim(),
      img_order: order,
    });

    const images = await ProductImage.findAll({
      where: { product_id: pid },
      order: [
        ['img_order', 'ASC'],
        ['id', 'ASC'],
      ],
    });

    return res.json({ status: 'success', product_id: pid, created, images });
  } catch (e) {
    console.error('[ERR] POST /:productId/images', e);
    return res.status(500).json({
      status: 'error',
      message:
        process.env.NODE_ENV === 'production'
          ? '이미지 등록 실패'
          : e.message || '이미지 등록 실패',
      code: 500,
    });
  }
});

/**
 * ✅ AI 상세 설명 생성 (OpenAI 호출)
 * POST /api/s-products/:productId/description/ai-gen
 * Body: { product_id: number, keywords: string }
 * Res:  { generatedDescription: string }
 */
router.post('/:productId/description/ai-gen', async (req, res) => {
  try {
    const { productId } = req.params;
    const { product_id, keywords } = req.body;

    // 입력 검증
    if (!productId || !product_id || Number(productId) !== Number(product_id)) {
      return res
        .status(400)
        .json({ status: 'error', message: '잘못된 상품 ID입니다.', code: 400 });
    }
    if (!keywords || !String(keywords).trim()) {
      return res
        .status(400)
        .json({ status: 'error', message: '키워드를 입력해주세요.', code: 400 });
    }

    // 🔒 키 가드
    if (!process.env.OPENAI_API_KEY) {
      console.error('[AI] OPENAI_API_KEY is missing');
      return res
        .status(500)
        .json({ status: 'error', message: 'AI 설정이 올바르지 않습니다.', code: 500 });
    }

    // 라우트 내부에서 지연 생성(서버 부팅 시점 크래시 방지)
    const OpenAI = require('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // 🔸 프롬프트 (system + user)
    const systemPrompt = `
당신은 로컬푸드 전문 쇼핑몰의 마케팅 작가입니다. 
농산물의 산지, 재배 환경, 품질, 영양소, 활용법, 보관법 등을 바탕으로 소비자의 신뢰를 얻을 수 있는 상품 소개글을 작성해야 합니다. 
고객은 건강하고 안전한 먹거리를 찾고 있으며, 설명은 과장보다 정보 중심의 문체를 사용해야 합니다.
`.trim();

    const userPrompt = `
다음 키워드를 활용해 로컬푸드 상품 설명글을 20줄 이상 작성해줘. 

[키워드] ${String(keywords).trim()}

설명에는 아래 내용을 반드시 포함해줘:
- 작물의 산지의 환경적 특성
- 재배 토양의 장점
- 수확 후 처리 및 신선도 유지 방식
- 영양 성분 및 건강 효능
- 조리 활용 예시(ex. 생식, 조림, 주스 등)와 조리 방법
- 보관 및 세척 방법
- 왜 이 상품이 좋은 선택인지

상품 상세페이지에 직접 사용할 수 있을 정도로 구체적이고 신뢰감 있게 써줘. 감성적인 문장은 포함해도 되지만 정보가 가장 중요해.
`.trim();

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // 필요 시 변경
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      // temperature: 0.7,
      // max_tokens: 1200,
    });

    const generatedDescription =
      completion?.choices?.[0]?.message?.content?.trim() || '';

    if (!generatedDescription) {
      return res
        .status(500)
        .json({ status: 'error', message: 'AI 설명 생성 실패', code: 500 });
    }

    // 프론트 명세에 맞춰 반환
    return res.json({ generatedDescription });
  } catch (e) {
    console.error('[ERR] POST /:productId/description/ai-gen', e);
    return res
      .status(500)
      .json({ status: 'error', message: 'AI 설명 생성 실패', code: 500 });
  }
});

module.exports = router;
