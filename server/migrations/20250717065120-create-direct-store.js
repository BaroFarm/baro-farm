'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('direct_store', {
      direct_store_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      seller_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'seller', // 외래키 연결 대상 테이블
          key: 'seller_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      latitude: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      longitude: {
        type: Sequelize.FLOAT,
        allowNull: false,
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('direct_store');
  }
};
