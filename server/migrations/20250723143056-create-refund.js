'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('refund', {
      refund_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      payment_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'payment',
          key: 'payment_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      amount: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      reason: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('완료', '거절', '요청됨', '승인됨'),
        allowNull: false
      },
      refunded_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('refund');
  }
};
