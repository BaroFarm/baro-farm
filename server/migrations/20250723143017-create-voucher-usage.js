'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('voucher_usage', {
      voucher_usage_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      user_voucher_id: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      used_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      used_amount: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      remaining_amount: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      used_in: {
        type: Sequelize.STRING,
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('voucher_usage');
  }
};
