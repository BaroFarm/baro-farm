// server/models/store_wishlist.js
module.exports = (sequelize, DataTypes) => {
  const StoreWishlist = sequelize.define('StoreWishlist', {
    store_wishlist_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    store_id: {
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
    tableName: 'store_wishlist',
    timestamps: false,
    underscored: true
  });

  StoreWishlist.associate = (models) => {
    StoreWishlist.belongsTo(models.Store, {
      foreignKey: 'store_id',
      targetKey: 'store_id'
    });
    StoreWishlist.belongsTo(models.Customer, {
      foreignKey: 'customer_id',
      targetKey: 'customer_id'
    });
  };

  return StoreWishlist;
};
