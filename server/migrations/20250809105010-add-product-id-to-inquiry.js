module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('inquiry', 'product_id', {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'product',
        key: 'product_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('inquiry', 'product_id');
  }
};
