// server/models/product_img.js
module.exports = (sequelize, DataTypes) => {
  const ProductImg = sequelize.define('ProductImg', {
    img_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    product_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    img_url: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    img_order: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    }
  }, {
    tableName: 'product_img',
    timestamps: false,
    underscored: true,
  });

  ProductImg.associate = (models) => {
    ProductImg.belongsTo(models.Product, {
      foreignKey: 'product_id',
      // targetKey: 'product_id',
    });
  };

  return ProductImg;
};