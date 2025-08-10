// server/models/coupon.js
module.exports = (sequelize, DataTypes) => {
  const Coupon = sequelize.define('Coupon', {
    coupon_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('percent', 'amount'),
      allowNull: false
    },
    value: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    min_order_account: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    max_discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    is_available: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    closed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    valid_from: {
      type: DataTypes.DATE,
      allowNull: false
    },
    valid_at: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'coupon',
    timestamps: false,
    underscored: true
  });

  Coupon.associate = (models) => {
    Coupon.hasMany(models.IssueCoupon, {
      foreignKey: 'coupon_id',
      sourceKey: 'coupon_id'
    });
  };

  return Coupon;
};
