// controllers/yourpath/postBasicInfo.js
const path = require("path");
const { Product, Seller } = require("../../models");

// 상품 기본 정보 등록
exports.postBasicInfo = async (req, res) => {
  try {
    // 판매자인지 확인
    if (!req.user || req.user.user_type !== "seller") {
      return res.status(403).json({ error: "판매자만 상품을 등록할 수 있습니다." });
    }

    const {
      title,
      category_id,
      direct_store_id,
      status,
      weight,
      price,
      description,
      intro,
      is_video,
      video_url,
      // created_at,   // 요청 본문에서 받아도 되고, 없으면 서버에서 생성
      returnable,
      regular_delivery,
      figma_export_url,
    } = req.body;

    // seller_id 보장 (req.user.seller_id 없을 때 대비)
    const sellerId = req.user.seller_id ?? req.user.id;

    const payload = {
      title: String(title).trim(),
      category_id: Number(category_id),
      seller_id: sellerId,
      direct_store_id: Number(direct_store_id),
      status: status ? String(status) : "active",
      weight: Number(weight),
      price: Number(price),
      // ▼ notNull이면 ''로, null 허용이면 그대로 두세요
      description: description ?? null,
      intro: intro ?? null,
      is_video: Boolean(is_video) || false,
      video_url: video_url ?? null,
      returnable: typeof returnable === "boolean" ? returnable : false,
      regular_delivery: typeof regular_delivery === "boolean" ? regular_delivery : false,
      figma_export_url: figma_export_url ?? null,

      // ✅ 핵심: created_at이 NOT NULL이라면 반드시 값 넣기
      created_at: req.body?.created_at ? new Date(req.body.created_at) : new Date(),
      // updated_at은 Sequelize가 관리하므로 포함하지 않음
    };

    // 필수값 빠졌을 때 400
    if (!payload.title || !payload.category_id || !payload.direct_store_id || !payload.weight || !payload.price) {
      return res.status(400).json({
        error: "필수 항목 누락",
        details: "title/category_id/direct_store_id/weight/price",
      });
    }
    if (!payload.seller_id) {
      return res.status(400).json({ error: "판매자 정보를 찾을 수 없습니다.(seller_id 없음)" });
    }

    const newProduct = await Product.create(payload);
    return res.status(201).json({ product: newProduct });
  } catch (err) {
    console.error("상품 등록 오류:", err);
    return res.status(500).json({ error: "상품 등록 실패", details: err.message });
  }
};
