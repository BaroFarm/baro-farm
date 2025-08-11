'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('inquiry', {
      inquiry_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      customer_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      content: {
        type: Sequelize.STRING(1000),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      category: {
        type: Sequelize.ENUM(
          '회원/계정 문의',
          '주문/결제 문의',
          '배송 문의',
          '반품/교환/환불',
          '쿠폰/포인트 문의',
          '상품 문의',
          '이벤트/프로모션 문의',
          '기타 문의'
        ),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('접수', '답변 완료'),
        allowNull: false,
      },
      is_visible: {
        type: Sequelize.ENUM('공개', '비공개'),
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('inquiry');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_inquiry_category";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_inquiry_status";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_inquiry_is_visible";');
  }
};
