'use strict';

module.exports = {
  async up (queryInterface) {
    const now = new Date();
    const q = (sql) => queryInterface.sequelize.query(sql);
    const scalar = async (sql) => {
      const [rows] = await q(sql);
      return rows && rows[0] ? Object.values(rows[0])[0] : null;
    };
    const hasTable = async (name) => {
      const [rows] = await q(
        `SELECT 1 FROM information_schema.tables
         WHERE table_schema = DATABASE() AND table_name='${name}' LIMIT 1`
      );
      return rows.length > 0;
    };

    // 고정값
    const CUSTOMER_ID = 4;
    const CATEGORY_ID = 3;
    const SELLER_ID   = 1;

    // direct_store
    let DIRECT_STORE_ID = 1;
    if (await hasTable('direct_store')) {
      DIRECT_STORE_ID = (await scalar('SELECT direct_store_id FROM direct_store LIMIT 1')) || 1;
    }

    // address (없으면 더미 1 사용)
    let ADDRESS_ID = 1;
    if (await hasTable('address')) {
      ADDRESS_ID = await scalar(`SELECT address_id FROM address WHERE customer_id=${CUSTOMER_ID} LIMIT 1`);
      if (!ADDRESS_ID) {
        await queryInterface.bulkInsert('address', [{
          customer_id: CUSTOMER_ID,
          receiver_name: '홍길동',
          receiver_phone: '010-1234-5678',
          zip_code: '00000',
          street: '테스트로 1',
          detail: '101호'
        }]);
        ADDRESS_ID = (await scalar(
          `SELECT address_id FROM address WHERE customer_id=${CUSTOMER_ID} ORDER BY address_id DESC LIMIT 1`
        )) || 1;
      }
    }

    // coupon & issue_coupon
    let ISSUE_COUPON_ID = 1;
    if (await hasTable('issue_coupon')) {
      ISSUE_COUPON_ID = await scalar('SELECT issue_coupon_id FROM issue_coupon LIMIT 1');
      let COUPON_ID = 1;
      if (await hasTable('coupon')) {
        COUPON_ID = await scalar('SELECT coupon_id FROM coupon LIMIT 1');
        if (!COUPON_ID) {
          const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          await queryInterface.bulkInsert('coupon', [{
            name: '테스트 10% 할인',
            type: 'percent',
            value: 10,
            min_order_account: null,
            max_discount: null,
            is_available: 1,
            created_at: now,
            closed_at: in30,
            valid_from: now,
            valid_at: in30
          }]);
          COUPON_ID = await scalar('SELECT coupon_id FROM coupon ORDER BY coupon_id DESC LIMIT 1');
        }
      } else {
        COUPON_ID = null; // coupon 테이블 자체가 없으면 issue_coupon 생성 안 함
      }

      if (!ISSUE_COUPON_ID && COUPON_ID) {
        await queryInterface.bulkInsert('issue_coupon', [{
          coupon_id: COUPON_ID,
          customer_id: CUSTOMER_ID,
          issued_at: now,
          status: 'issued'
        }]);
        ISSUE_COUPON_ID = await scalar(
          'SELECT issue_coupon_id FROM issue_coupon ORDER BY issue_coupon_id DESC LIMIT 1'
        );
      }
    }

    // issue_voucher (FK 대상 테이블)
    let USER_VOUCHER_ID = null; // 없음을 명확히 표시
    if (await hasTable('issue_voucher')) {
      USER_VOUCHER_ID = await scalar('SELECT user_voucher_id FROM issue_voucher LIMIT 1') || null;
      // 스키마 모르는 상태라 여기서 생성은 보류 (DESC를 받으면 생성 코드 넣어줄 수 있음)
    }

    // product
    await queryInterface.bulkInsert('product', [
      {
        product_id: 1001,
        category_id: CATEGORY_ID,
        seller_id: SELLER_ID,
        direct_store_id: DIRECT_STORE_ID,
        title: '테스트 사과',
        status: '판매중',
        weight: '1kg',
        price: 5000,
        description: '테스트용 사과입니다.',
        intro: '상세 소개 텍스트',
        figma_export_url: null,
        is_video: 0,
        video_url: null,
        created_at: now,
        updated_at: now,
        returnable: 1,
        regular_delivery: 0
      },
      {
        product_id: 1002,
        category_id: CATEGORY_ID,
        seller_id: SELLER_ID,
        direct_store_id: DIRECT_STORE_ID,
        title: '테스트 배',
        status: '판매중',
        weight: '1kg',
        price: 4000,
        description: '테스트용 배입니다.',
        intro: '상세 소개 텍스트',
        figma_export_url: null,
        is_video: 0,
        video_url: null,
        created_at: now,
        updated_at: now,
        returnable: 1,
        regular_delivery: 0
      }
    ]);

    // product_img
    await queryInterface.bulkInsert('product_img', [
      { product_id: 1001, img_url: 'https://picsum.photos/seed/apple/400/400', created_at: now, img_order: 1 },
      { product_id: 1002, img_url: 'https://picsum.photos/seed/pear/400/400',  created_at: now, img_order: 1 },
    ]);

    // order (USER_VOUCHER_ID 없으면 FK 체크 잠시 OFF)
    const orderRow = {
      order_id: 9001,
      customer_id: CUSTOMER_ID,
      address_id: ADDRESS_ID ?? 1,
      issue_coupon_id: ISSUE_COUPON_ID ?? 1,
      user_voucher_id: USER_VOUCHER_ID ?? 1, // NOT NULL 이므로 숫자 필요
      order_date: now,
      order_state: '결제 완료',
      delivery_type: '일반 배송',
      order_shipping_fee: 3000,
      order_price: 16000,
      receiver_name: '홍길동',
      receiver_phone: '010-1234-5678',
      created_at: now,
      updated_at: now
    };

    if (USER_VOUCHER_ID === null) {
      await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
      await queryInterface.bulkInsert('order', [orderRow]);
      await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    } else {
      await queryInterface.bulkInsert('order', [orderRow]);
    }

    // order_product
    await queryInterface.bulkInsert('order_product', [
      { order_id: 9001, product_id: 1001, order_product_quantity: 1, order_product_price: 5000, total_price: 5000, created_at: now },
      { order_id: 9001, product_id: 1002, order_product_quantity: 2, order_product_price: 4000, total_price: 8000, created_at: now },
    ]);

    // payment
    await queryInterface.bulkInsert('payment', [
      {
        order_id: 9001,
        pg_provider: '테스트PG',
        method: '카드',
        amount: 16000,
        status: '성공',
        pg_tid: 'TEST-TID-9201',
        approved_at: now,
        created_at: now,
        updated_at: now
      }
    ]);

    // payment_id 조회 → refund
    const paymentId = await scalar(
      'SELECT payment_id FROM payment WHERE order_id = 9001 ORDER BY payment_id DESC LIMIT 1'
    );

    await queryInterface.bulkInsert('refund', [
      {
        payment_id: paymentId,
        amount: 5000,
        reason: '단순 변심',
        status: '완료',
        refunded_at: now,
        created_at: now
      }
    ]);
  },

  async down (queryInterface) {
    const [[p]] = await queryInterface.sequelize.query(
      'SELECT payment_id FROM payment WHERE order_id = 9001 ORDER BY payment_id DESC LIMIT 1'
    );
    const paymentId = p && p.payment_id;

    if (paymentId) {
      await queryInterface.bulkDelete('refund',  { payment_id: paymentId });
      await queryInterface.bulkDelete('payment', { payment_id: paymentId });
    }

    await queryInterface.bulkDelete('order_product', { order_id: 9001 });
    await queryInterface.bulkDelete('order',         { order_id: 9001 });
    await queryInterface.bulkDelete('product_img',   { product_id: [1001, 1002] });
    await queryInterface.bulkDelete('product',       { product_id: [1001, 1002] });
  }
};
