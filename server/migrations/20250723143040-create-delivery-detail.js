'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('delivery_detail', {
      delivery_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      order_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'order',
          key: 'order_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      pickup_time: {
        type: Sequelize.DATE,
        allowNull: true
      },
      subscription_cycle: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      delivered_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      is_delivered: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      delivery_status: {
        type: Sequelize.ENUM('배송준비', '배송중', '배송완료'),
        allowNull: false
      },
      tracking_number: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      courier: {
        type: Sequelize.STRING,
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('delivery_detail');
  }
};
