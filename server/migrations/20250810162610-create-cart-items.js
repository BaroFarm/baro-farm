'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('cart_items', {
      cart_item_id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      cart_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'cart',
          key: 'cart_id'
        },
        onDelete: 'CASCADE'
      },
      product_id: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      delivery_type: {
        type: Sequelize.ENUM('pickup', 'smart'),
        allowNull: false
      },
      add_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('cart_items');
  }
};
