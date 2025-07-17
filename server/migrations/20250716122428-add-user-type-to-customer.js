'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('customer', 'user_type', {
      type: Sequelize.ENUM('buyer', 'seller'),
      allowNull: false,
      defaultValue: 'buyer'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('customer', 'user_type');
  }
};
