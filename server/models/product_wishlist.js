// server/models/product_wishlist.js
module.exports = (sequelize, DataTypes) => {
  const ProductWishlist = sequelize.define('ProductWishlist', {
    product_wishlist_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    product_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    customer_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'product_wishlist',
    timestamps: false,
    underscored: true
  });

  ProductWishlist.associate = (models) => {
    ProductWishlist.belongsTo(models.Product, {
      foreignKey: 'product_id',
      targetKey: 'product_id'
    });
    ProductWishlist.belongsTo(models.Customer, {
      foreignKey: 'customer_id',
      targetKey: 'customer_id'
    });
  };

  return ProductWishlist;
};
