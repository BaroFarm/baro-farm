'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('customer', 'zipCode', 'zip_code');
    await queryInterface.renameColumn('store', 'zipCode', 'zip_code');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('customer', 'zip_code', 'zipCode');
    await queryInterface.renameColumn('store', 'zip_code', 'zipCode');
  }
};
