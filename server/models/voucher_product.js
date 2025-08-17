
module.exports = (sequelize, DataTypes) => {
  const VoucherProduct = sequelize.define('VoucherProduct', {
    voucher_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false
    },
    voucher_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    valid_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    refundable_date: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'voucher_product',
    timestamps: false
  });

  VoucherProduct.associate = models => {
    VoucherProduct.hasMany(models.IssueVoucher, {
      foreignKey: 'voucher_id',
      sourceKey: 'voucher_id'
    });
  };

  return VoucherProduct;
};
