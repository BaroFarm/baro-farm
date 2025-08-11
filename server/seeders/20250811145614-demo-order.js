'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    // 0) 카테고리(3: 과일, 견과) — 없으면 생성
    await queryInterface.bulkInsert('category', [{
      category_id: 3,
      name: '과일, 견과',
      created_at: now
    }], {}).catch(() => {}); // 중복이면 무시

    // 1) store
    await queryInterface.bulkInsert('store', [{
      store_id: 1,
      name: '로컬푸드상점',
      zip_code: '06236',
      street: '경기도 이천시 이섭대로 945번길 6',
      detail: '율현동 265',
      created_at: now
    }], {}).catch(() => {});

    // 2) seller (store_id 참조)
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
    }], {}).catch(() => {});

    // 3) direct_store (seller_id 필수)
    await queryInterface.bulkInsert('direct_store', [{
      direct_store_id: 1,
      seller_id: 1,
      name: '로컬푸드 직매장',
      address: '서울 강남구 테헤란로 B1',
      created_at: now,
      latitude: 37.4979,
      longitude: 127.0276
    }], {}).catch(() => {});

    // 4) customer (로그인 유저 4번)
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
    }], {}).catch(() => {});

    // 5) product (필수 전부 채움)
    await queryInterface.bulkInsert('product', [{
      product_id: 1,
      category_id: 3,
      seller_id: 1,
      direct_store_id: 1,
      title: '유기농 사과',
      status: '판매중',      // enum('판매중','품절','판매 중지')
      weight: '1kg',
      price: 9900,
      description: '상세설명입니다.',
      intro: '소개글입니다.',
      is_video: 0,
      created_at: now,
      returnable: 1,
      regular_delivery: 0
    }], {}).catch(() => {});

    // 6) product_img (선택)
    await queryInterface.bulkInsert('product_img', [{
      product_id: 1,
      img_url: '~'
    }], {}).catch(() => {});

    // 7) order (ENUM/필수 충족; FK는 임시값 사용 가능)
    await queryInterface.bulkInsert('order', [{
      order_id: 1,               // 테스트 고정
      customer_id: 4,
      address_id: 1,
      issue_coupon_id: 0,
      user_voucher_id: 0,
      order_date: new Date('2025-07-24T00:56:09Z'),
      order_state: '결제 완료',   // ENUM OK
      delivery_type: '일반 배송', // ENUM OK
      order_shipping_fee: 3000,
      order_price: 9900,
      receiver_name: '구매자 이름',
      receiver_phone: '01022223333',
      created_at: now,
      updated_at: now
    }], {}).catch(() => {});

    // 8) order_product
    await queryInterface.bulkInsert('order_product', [{
      order_id: 1,
      product_id: 1,
      order_product_quantity: 1,
      order_product_price: 9900,
      total_price: 9900,
      created_at: now
    }], {}).catch(() => {});

    // 9) delivery_detail (필수: is_delivered, tracking_number, courier)
    await queryInterface.bulkInsert('delivery_detail', [{
      order_id: 1,
      pickup_time: null,
      subscription_cycle: null,
      delivered_at: null,
      is_delivered: 0,
      delivery_status: '배송중',
      tracking_number: 1234567890124,
      courier: '로젠택배'
    }], {}).catch(() => {});

    // 10) payment (status ENUM 맞춤)
    await queryInterface.bulkInsert('payment', [{
      order_id: 1,
      pg_provider: 'kcp',
      method: '카드',
      amount: 9900,
      status: '성공', // '성공' | '실패' | '취소' | '처리중'
      pg_tid: 'TID-TEST-001',
      approved_at: new Date('2025-07-24T00:57:32Z'),
      created_at: now,
      updated_at: now
    }], {}).catch(() => {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('payment',         { order_id: 1 }, {});
    await queryInterface.bulkDelete('delivery_detail', { order_id: 1 }, {});
    await queryInterface.bulkDelete('order_product',   { order_id: 1 }, {});
    await queryInterface.bulkDelete('order',           { order_id: 1 }, {});
    await queryInterface.bulkDelete('product_img',     { product_id: 1 }, {});
    await queryInterface.bulkDelete('product',         { product_id: 1 }, {});
    await queryInterface.bulkDelete('customer',        { customer_id: 4 }, {});
    await queryInterface.bulkDelete('direct_store',    { direct_store_id: 1 }, {});
    await queryInterface.bulkDelete('seller',          { seller_id: 1 }, {});
    await queryInterface.bulkDelete('store',           { store_id: 1 }, {});
    await queryInterface.bulkDelete('category',        { category_id: 3 }, {});
  }
};
