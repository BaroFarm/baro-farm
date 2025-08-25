'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('product', 'figma_export_url', {
      type: Sequelize.STRING(1024),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('product', 'figma_export_url');
  }
};
