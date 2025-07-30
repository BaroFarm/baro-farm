// server/models/category.js
module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    category_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    category_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    }
  }, {
    tableName: 'category',
    timestamps: false,
    underscored: true,
  });

  Category.associate = (models) => {
    Category.hasMany(models.Product, {
      foreignKey: 'category_id',
      sourceKey: 'category_id',
    });
  };
  
  return Category;
};