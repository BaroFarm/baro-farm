// server/models/ProductImage.js
module.exports = (sequelize, DataTypes) => {
  const ProductImage = sequelize.define('ProductImage', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    img_id: { type: DataTypes.STRING, allowNull: false },
    img_url: { type: DataTypes.STRING, allowNull: false },
    img_order: { type: DataTypes.INTEGER, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false },
  }, {
    tableName: 'product_images',
    timestamps: false,
  });

  return ProductImage;
};
