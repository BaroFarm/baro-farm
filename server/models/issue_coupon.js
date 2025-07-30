// server/models/issue_coupon.js
module.exports = (sequelize, DataTypes) => {
  const IssueCoupon = sequelize.define('IssueCoupon', {
    issue_coupon_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    coupon_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    customer_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    issued_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('issued', 'used', 'expired'),
      allowNull: false
    }
  }, {
    tableName: 'issue_coupon',
    timestamps: false,
    underscored: true
  });

  IssueCoupon.associate = (models) => {
    IssueCoupon.belongsTo(models.Coupon, {
      foreignKey: 'coupon_id',
      targetKey: 'coupon_id'
    });

    IssueCoupon.belongsTo(models.Customer, {
      foreignKey: 'customer_id',
      targetKey: 'customer_id'
    });

    IssueCoupon.hasMany(models.Order, {
      foreignKey: 'issue_coupon_id',
      sourceKey: 'issue_coupon_id'
    });
  };

  return IssueCoupon;
};
