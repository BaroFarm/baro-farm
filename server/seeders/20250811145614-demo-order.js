'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. store 생성
    await queryInterface.bulkInsert('store', [{
      store_id: 1,
      name: '로컬푸드상점',
      created_at: new Date(),
      updated_at: new Date()
    }], {});

    // 2. seller 생성
    await queryInterface.bulkInsert('seller', [{
      seller_id: 1,
      store_id: 1,
      user_type: 'seller',
      email: 'seller@example.com',
      password: 'hashedpassword', // 실제는 bcrypt 해시 필요
      name: '로컬푸드상점',
      phone: '01012345678',
      business_number: '123-45-67890',
      license_number: 'LIC-0001',
      contact: '01012345678',
      verified: 1,
      created_at: new Date(),
      status: '활성'
    }], {});

    // 3. product 생성
    await queryInterface.bulkInsert('product', [{
      product_id: 1,
      seller_id: 1,
      title: '유기농 사과',
      price: 9900,
      created_at: new Date(),
      updated_at: new Date()
    }], {});

    // 4. product_img 생성
    await queryInterface.bulkInsert('product_img', [{
      img_id: 1,
      product_id: 1,
      img_url: '~'
    }], {});

    // 5. customer 생성
    await queryInterface.bulkInsert('customer', [{
      customer_id: 1,
      user_type: 'buyer',
      email: 'buyer@example.com',
      password: 'hashedpassword', // 실제 해시 필요
      name: '구매자 이름',
      nickname: 'buyer1',
      phone: '01022223333',
      zip_code: '12345',
      street: '서울특별시 강남구 테헤란로',
      detail: '101호',
      created_at: new Date(),
      status: '활성'
    }], {});

    // 6. order 생성
    await queryInterface.bulkInsert('order', [{
      order_id: 1,
      customer_id: 1,
      order_date: new Date('2025-07-24T00:56:09.000Z'),
      order_state: '결제 완료',
      order_shipping_fee: 3000,
      order_price: 9900,
      receiver_name: '구매자 이름',
      receiver_phone: '01022223333',
      created_at: new Date(),
      updated_at: new Date()
    }], {});

    // 7. order_product 생성
    await queryInterface.bulkInsert('order_product', [{
      order_product_id: 1,
      order_id: 1,
      product_id: 1,
      order_product_quantity: 1,
      order_product_price: 9900,
      total_price: 9900,
      created_at: new Date()
    }], {});

    // 8. delivery_detail 생성
    await queryInterface.bulkInsert('delivery_detail', [{
      delivery_id: 1,
      order_id: 1,
      delivery_status: '배송중',
      tracking_number: '1234567890124',
      courier: '로젠택배'
    }], {});

    // 9. payment 생성
    await queryInterface.bulkInsert('payment', [{
      payment_id: 1,
      order_id: 1,
      method: '카드',
      amount: 9900,
      approved_at: new Date('2025-07-24T00:57:32.000Z'),
      status: '완료'
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('payment', null, {});
    await queryInterface.bulkDelete('delivery_detail', null, {});
    await queryInterface.bulkDelete('order_product', null, {});
    await queryInterface.bulkDelete('order', null, {});
    await queryInterface.bulkDelete('customer', null, {});
    await queryInterface.bulkDelete('product_img', null, {});
    await queryInterface.bulkDelete('product', null, {});
    await queryInterface.bulkDelete('seller', null, {});
    await queryInterface.bulkDelete('store', null, {});
  }
};
