'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('inquiry_reply', {
      inquiry_reply_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      inquiry_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'inquiry',
          key: 'inquiry_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      content: {
        type: Sequelize.STRING(1000),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      is_visible: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('inquiry_reply');
  }
};
