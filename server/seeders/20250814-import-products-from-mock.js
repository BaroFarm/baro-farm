'use strict';

// 1) Mockaroo JSON 불러오기 (배열 형태여야 함)
const raw = require('../mock/mock-products.json');

// 2) 유틸
const parseDate = (v) => {
  const d = new Date(v);
  return isNaN(d.getTime()) ? new Date() : d;
};

const pickStatus = (v) => {
  const allowed = ['판매중', '품절', '판매 중지'];
  return allowed.includes(v) ? v : '판매중';
};

const pickWeight = (v) => {
  const w = v && String(v).trim() ? String(v).trim() : '1kg';
  // DB 스키마: STRING(50) 가정 → 초과 컷
  return w.length > 50 ? w.slice(0, 50) : w;
};

const truncate = (s, max) => {
  if (s == null) return s;
  const t = String(s);
  return t.length > max ? t.slice(0, max) : t;
};

const MAX_URL = 500;
const sanitizeUrl = (u) => {
  if (!u || typeof u !== 'string') return null;
  return u.length <= MAX_URL ? u : null; // 또는 u.slice(0, MAX_URL)
};

module.exports = {
  async up (queryInterface) {
    const now = new Date();

    const rows = raw.map((r, i) => {
      // 안전 처리
      const title = truncate(r.title ?? '상품', 255);
      const weight = pickWeight(r.weight);
      const status = pickStatus(r.status);
      const price = Math.round((Number(r.price) || 0) / 100) * 100;

      // 비디오 URL 정리
      const cleanedUrl = sanitizeUrl(r.video_url);
      const hasVideo = Boolean(r.is_video) && !!cleanedUrl;

      return {
        category_id: Number(r.category_id) || 1,
        seller_id: Number(r.seller_id) || 1,
        direct_store_id: Number(r.direct_store_id) || 1,

        title,
        status,
        weight,
        price,

        description: r.description ?? '',
        intro: r.intro ?? '',

        is_video: hasVideo,
        video_url: hasVideo ? cleanedUrl : null,

        created_at: r.created_at ? parseDate(r.created_at) : now,
        updated_at: r.updated_at ? parseDate(r.updated_at) : now,

        returnable: typeof r.returnable === 'boolean' ? r.returnable : true,
      };
    });

    await queryInterface.bulkInsert('product', rows, {});
  },

  async down (queryInterface) {
    await queryInterface.bulkDelete('product', null, {});
  }
};
