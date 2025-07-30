'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('review', {
      review_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      customer_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'customer', key: 'customer_id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      product_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'product', key: 'product_id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      content: {
        type: Sequelize.STRING(1000),
        allowNull: false
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      img_url: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      created_date: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('review');
  }
};
