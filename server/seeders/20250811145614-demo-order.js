'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    // 0) category (컬럼명: category_name)
    await queryInterface.bulkInsert('category', [{
      category_id: 3,
      category_name: '과일, 견과',
      // created_at 컬럼이 없다면 이 줄은 빼세요
      // created_at: now,
    }], {})
    .catch(e => { console.error('category seed 실패:', e); throw e; });

    // 1) store
    await queryInterface.bulkInsert('store', [{
      store_id: 1,
      name: '로컬푸드상점',
      zip_code: '06236',
      street: '경기도 이천시 이섭대로 945번길 6',
      detail: '율현동 265',
      created_at: now
    }], {})
    .catch(e => { console.error('store seed 실패:', e); throw e; });

    // 2) seller
    await queryInterface.bulkInsert('seller', [{
      seller_id: 1,
      store_id: 1,
      user_type: 'seller',
      email: 'seller@example.com',
      password: 'hashedpassword',
      name: '로컬푸드상점',
      phone: '01012345678',
      business_number: '123-45-67890',
      license_number: 'LIC-0001',
      contact: '01012345678',
      verified: 1,
      created_at: now,
      status: '활성'
    }], {})
    .catch(e => { console.error('seller seed 실패:', e); throw e; });

    // 3) direct_store
    await queryInterface.bulkInsert('direct_store', [{
      direct_store_id: 1,
      seller_id: 1,
      name: '로컬푸드 직매장',
      address: '서울 강남구 테헤란로 B1',
      created_at: now,
      latitude: 37.4979,
      longitude: 127.0276
    }], {})
    .catch(e => { console.error('direct_store seed 실패:', e); throw e; });

    // 4) customer (로그인 토큰의 customer_id가 4여야 매칭됨)
    await queryInterface.bulkInsert('customer', [{
      customer_id: 4,
      user_type: 'buyer',
      email: 'buyer@example.com',
      password: 'abcd1234!',
      name: '홍길동',
      nickname: '빙빙',
      phone: '01022223333',
      zip_code: '12345',
      street: '서울특별시 강남구 테헤란로',
      detail: '101호',
      created_at: now,
      status: '활성'
    }], {})
    .catch(e => { console.error('customer seed 실패:', e); throw e; });

    // 5) product (id 강제 X → 실제 삽입된 id 조회)
    await queryInterface.bulkInsert('product', [{
      category_id: 3,
      seller_id: 1,
      direct_store_id: 1,
      title: '유기농 사과',
      status: '판매중',
      weight: '1kg',
      price: 9900,
      description: '상세설명입니다.',
      intro: '소개글입니다.',
      is_video: 0,
      created_at: now,
      returnable: 1,
      regular_delivery: 0
    }], {})
    .catch(e => { console.error('product seed 실패:', e); throw e; });

    const [[p]] = await queryInterface.sequelize.query(
      "SELECT product_id FROM product WHERE title='유기농 사과' AND seller_id=1 ORDER BY product_id DESC LIMIT 1"
    );
    if (!p?.product_id) throw new Error('product 조회 실패');
    const productId = p.product_id;

    // 6) product_img (created_at 반드시)
    await queryInterface.bulkInsert('product_img', [{
      product_id: productId,
      img_url: 'https://picsum.photos/seed/apple/600/600',
      created_at: now
    }], {})
    .catch(e => { console.error('product_img seed 실패:', e); throw e; });

    // 주문 넣기 직전에 추가
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS=0');
    // 7) order (id 강제 X → 실제 삽입된 id 조회)
    await queryInterface.bulkInsert('order', [{
      customer_id: 4,
      address_id: 1,
      issue_coupon_id: 0,
      user_voucher_id: 0,
      order_date: new Date('2025-07-24T00:56:09Z'),
      order_state: '결제 완료',
      delivery_type: '일반 배송',
      order_shipping_fee: 3000,
      order_price: 9900,
      receiver_name: '구매자 이름',
      receiver_phone: '01022223333',
      created_at: now,
      updated_at: now
    }], {})
    .catch(e => { console.error('order seed 실패:', e); throw e; });

    const [[o]] = await queryInterface.sequelize.query(
      "SELECT order_id FROM `order` WHERE customer_id=4 ORDER BY created_at DESC LIMIT 1"
    );
    if (!o?.order_id) throw new Error('order 조회 실패');
    const orderId = o.order_id;

    // 주문 넣고 바로 다시 켜기
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS=1');

    // 8) order_product (조회한 id 사용)
    await queryInterface.bulkInsert('order_product', [{
      order_id: orderId,
      product_id: productId,
      order_product_quantity: 1,
      order_product_price: 9900,
      total_price: 9900,
      created_at: now
    }], {})
    .catch(e => { console.error('order_product seed 실패:', e); throw e; });

    // 9) delivery_detail
    await queryInterface.bulkInsert('delivery_detail', [{
      order_id: orderId,
      pickup_time: null,
      subscription_cycle: null,
      delivered_at: null,
      is_delivered: 0,
      delivery_status: '배송중',
      tracking_number: 1234567890124,
      courier: '로젠택배'
    }], {})
    .catch(e => { console.error('delivery_detail seed 실패:', e); throw e; });

    // 10) payment
    await queryInterface.bulkInsert('payment', [{
      order_id: orderId,
      pg_provider: 'kcp',
      method: '카드',
      amount: 9900,
      status: '성공',
      pg_tid: 'TID-TEST-001',
      approved_at: new Date('2025-07-24T00:57:32Z'),
      created_at: now,
      updated_at: now
    }], {})
    .catch(e => { console.error('payment seed 실패:', e); throw e; });
  },

  down: async (queryInterface, Sequelize) => {
  const t = await queryInterface.sequelize.transaction();
  try {
    // 관련 product_id들 먼저 조회
    const [prows] = await queryInterface.sequelize.query(
      "SELECT product_id FROM product WHERE title='유기농 사과' AND seller_id=1",
      { transaction: t }
    );
    const pids = prows.map(r => r.product_id);

    // 관련 order_id들 조회(고객 4의 주문)
    const [orows] = await queryInterface.sequelize.query(
      "SELECT order_id FROM `order` WHERE customer_id=4",
      { transaction: t }
    );
    const oids = orows.map(r => r.order_id);

    if (oids.length) {
      await queryInterface.bulkDelete('order_product', { order_id: { [Sequelize.Op.in]: oids } }, { transaction: t });
      await queryInterface.bulkDelete('payment',       { order_id: { [Sequelize.Op.in]: oids } }, { transaction: t });
      await queryInterface.bulkDelete('delivery_detail',{ order_id: { [Sequelize.Op.in]: oids } }, { transaction: t });
      await queryInterface.bulkDelete('order',         { order_id: { [Sequelize.Op.in]: oids } }, { transaction: t });
    }

    if (pids.length) {
      await queryInterface.bulkDelete('product_img', { product_id: { [Sequelize.Op.in]: pids } }, { transaction: t });
      await queryInterface.bulkDelete('order_product', { product_id: { [Sequelize.Op.in]: pids } }, { transaction: t });
      await queryInterface.bulkDelete('product',     { product_id: { [Sequelize.Op.in]: pids } }, { transaction: t });
    }

    await queryInterface.bulkDelete('customer',     { customer_id: 4 }, { transaction: t });
    await queryInterface.bulkDelete('direct_store', { direct_store_id: 1 }, { transaction: t });
    await queryInterface.bulkDelete('seller',       { seller_id: 1 }, { transaction: t });
    await queryInterface.bulkDelete('store',        { store_id: 1 }, { transaction: t });
    await queryInterface.bulkDelete('category',     { category_id: 3 }, { transaction: t });

    await t.commit();
  } catch (e) {
    await t.rollback();
    throw e;
  }
}
};

