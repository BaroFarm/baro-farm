'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('product_detail_page', {
      page_id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      product_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'product',
          key: 'product_id',
        },
        onDelete: 'CASCADE',
      },
      figma_file_key: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      figma_export_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      page_status: {
        type: Sequelize.ENUM('생성중', '완료', '실패'),
        defaultValue: '생성중',
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('product_detail_page');
  }
};