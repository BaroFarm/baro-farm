// server/models/delivery_detail.js
module.exports = (sequelize, DataTypes) => {
  const DeliveryDetail = sequelize.define('DeliveryDetail', {
    delivery_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    order_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    pickup_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    subscription_cycle: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    delivered_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    is_delivered: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    delivery_status: {
      type: DataTypes.ENUM('배송준비', '배송중', '배송완료'),
      allowNull: false
    },
    tracking_number: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    courier: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'delivery_detail',
    timestamps: false,
    underscored: true
  });

  DeliveryDetail.associate = (models) => {
    DeliveryDetail.belongsTo(models.Order, {
      foreignKey: 'order_id',
      targetKey: 'order_id'
    });
  };

  return DeliveryDetail;
};
