'use strict';
const raw = require('../mock/mock-products.json');

const normalizeLocal = (u) => {
  if (!u || typeof u !== 'string') return null;
  return u.startsWith('/') ? u : '/' + u.replace(/^\.?\/*/, '');
};

module.exports = {
  async up (queryInterface) {
    const now = new Date();

    // 1) product 삽입
    const products = raw.map((r) => ({
      category_id: Number(r.category_id) || 1,
      seller_id: Number(r.seller_id) || 1,
      direct_store_id: Number(r.direct_store_id) || 1,
      title: String(r.title || '상품').slice(0,255),
      status: ['판매중','품절','판매 중지'].includes(r.status) ? r.status : '판매중',
      weight: (r.weight && String(r.weight).trim() || '1kg').slice(0,50),
      price: Math.round((Number(r.price)||0)/100)*100,
      description: r.description ?? '',
      intro: r.intro ?? '',
      is_video: Boolean(r.is_video && r.video_url),
      video_url: (r.is_video && r.video_url) ? String(r.video_url).slice(0,500) : null,
      created_at: r.created_at ? new Date(r.created_at) : now,
      updated_at: r.updated_at ? new Date(r.updated_at) : now,
      returnable: typeof r.returnable === 'boolean' ? r.returnable : true,
    }));

    await queryInterface.bulkInsert('product', products, {});

    // 2) 각 상품의 id 조회 후 product_img 삽입
    for (const r of raw) {
      const img = normalizeLocal(r.image_url);
      if (!img) continue;
      // title + seller_id로 가장 최근 것 한 건
      const [[p]] = await queryInterface.sequelize.query(
        "SELECT product_id FROM product WHERE title = ? AND seller_id = ? ORDER BY product_id DESC LIMIT 1",
        { replacements: [String(r.title || '상품').slice(0,255), Number(r.seller_id)||1] }
      );
      if (!p?.product_id) continue;

      await queryInterface.bulkInsert('product_img', [{
        product_id: p.product_id,
        img_url: img,             // ✅ 로컬 경로 저장 (/images/mock/kiwi.jpg)
        created_at: now,
      }], {});
    }
  },

  async down (queryInterface) {
    // 이미지부터 지우고 product 지우기
    await queryInterface.bulkDelete('product_img', null, {});
    await queryInterface.bulkDelete('product', null, {});
  }
};
