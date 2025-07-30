'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('order', {
      order_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
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
      address_id: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      issue_coupon_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'issue_coupon',
          key: 'issue_coupon_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      user_voucher_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'issue_voucher',
          key: 'user_voucher_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      order_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      order_state: {
        type: Sequelize.ENUM('결제 완료', '배송중', '배송완료', '주문취소'),
        allowNull: false
      },
      delivery_type: {
        type: Sequelize.ENUM('일반 배송', '바로 배송', '바로 찾음', '정기 배송'),
        allowNull: false
      },
      order_shipping_fee: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      order_price: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      receiver_name: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      receiver_phone: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('order');
  }
};
