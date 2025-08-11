'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 현재 테이블 구조 조회
    const table = await queryInterface.describeTable('product');

    // 컬럼이 없을 때만 추가 (로컬/스테이징 환경 보호)
    if (!table.regular_delivery) {
      await queryInterface.addColumn('product', 'regular_delivery', {
        type: Sequelize.BOOLEAN,      // MySQL에서는 TINYINT(1)
        allowNull: false,
        defaultValue: false,
        // MySQL에서만 after 지원; 다른 DB면 무시됨
        after: 'returnable',
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('product');

    // 있으면 제거
    if (table.regular_delivery) {
      await queryInterface.removeColumn('product', 'regular_delivery');
    }
  }
};