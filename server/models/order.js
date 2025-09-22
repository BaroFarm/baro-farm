// server/models/order.js
module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    order_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    customer_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    address_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    issue_coupon_id: {
      type: DataTypes.BIGINT,
      allowNull: true, // 
    },
    user_voucher_id: {
      type: DataTypes.BIGINT,
      allowNull: true, //
    },
    order_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    order_state: {
      type: DataTypes.ENUM('결제 완료', '배송중', '배송완료', '주문취소'),
      allowNull: false,
    },
    delivery_type: {
      type: DataTypes.ENUM('일반 배송', '바로 배송', '바로 찾음', '정기 배송'),
      allowNull: false,
    },
    order_shipping_fee: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    order_price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    receiver_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    receiver_phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  }, {
    tableName: 'order',
    timestamps: false,
    underscored: true,
  });

  Order.associate = (models) => {
    Order.belongsTo(models.Customer, {
      foreignKey: 'customer_id',
      targetKey: 'customer_id',
    });

    Order.hasMany(models.OrderProduct, {
      as: 'items',
      foreignKey: 'order_id',
      sourceKey: 'order_id',
    });

    Order.hasOne(models.DeliveryDetail, {
      as: 'payment', //
      foreignKey: 'order_id',
      sourceKey: 'order_id',
    });

    Order.hasOne(models.Payment, {
      foreignKey: 'order_id',
      sourceKey: 'order_id',
    });
  };

  return Order;
};
