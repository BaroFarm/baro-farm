
module.exports = (sequelize, DataTypes) => {
  const VoucherUsage = sequelize.define('VoucherUsage', {
    voucher_usage_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
    },
    user_voucher_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    used_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    used_amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    remaining_amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    used_in: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    tableName: 'voucher_usage',
    timestamps: false,
  });

  VoucherUsage.associate = models => {
    VoucherUsage.belongsTo(models.IssueVoucher, {
      foreignKey: 'user_voucher_id',
      targetKey: 'user_voucher_id',
    });
  };

  return VoucherUsage;
};
