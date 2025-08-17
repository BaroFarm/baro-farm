'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('issue_voucher', {
      user_voucher_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        primaryKey: true
      },
      customer_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'customer',
          key: 'customer_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      voucher_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'voucher_product',
          key: 'voucher_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      voucher_usage_id: {
        type: Sequelize.BIGINT,
        allowNull: true
      },
      acquired_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      expired_at: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      used_amount: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      remaining_amount: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('active', 'used', 'expired'),
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('issue_voucher');
  }
};
