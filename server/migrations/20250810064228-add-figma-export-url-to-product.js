'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('product', 'figma_export_url', {
      type: Sequelize.STRING(1024),
      allowNull: true,
      after: 'intro', // 위치는 원하는 컬럼 뒤로 조정
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('product', 'figma_export_url');
  },
};
