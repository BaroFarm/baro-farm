'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('voucher_product', {
      voucher_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        primaryKey: true
      },
      voucher_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      amount: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      valid_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      refundable_date: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('voucher_product');
  }
};
