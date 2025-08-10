// server/models/order_product.js
module.exports = (sequelize, DataTypes) => {
  const OrderProduct = sequelize.define('OrderProduct', {
    order_product_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    order_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    product_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    order_product_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    order_product_price: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    total_price: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'order_product',
    timestamps: false,
    underscored: true
  });

  OrderProduct.associate = (models) => {
    OrderProduct.belongsTo(models.Order, {
      foreignKey: 'order_id',
      targetKey: 'order_id'
    });

    OrderProduct.belongsTo(models.Product, {
      foreignKey: 'product_id',
      targetKey: 'product_id'
    });
  };

  return OrderProduct;
};
