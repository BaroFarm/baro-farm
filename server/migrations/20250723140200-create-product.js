'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('product', {
      product_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      category_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'category',
          key: 'category_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      seller_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'seller',
          key: 'seller_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      direct_store_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'direct_store',
          key: 'direct_store_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('판매중', '품절', '판매 중지'),
        allowNull: false,
      },
      weight: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      price: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      intro: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      is_video: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      video_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      returnable: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('product');
  }
};