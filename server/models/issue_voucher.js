
module.exports = (sequelize, DataTypes) => {
  const IssueVoucher = sequelize.define('IssueVoucher', {
    user_voucher_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
    },
    customer_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    voucher_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    voucher_usage_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    acquired_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    expired_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    used_amount: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    remaining_amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'used', 'expired'),
      allowNull: false,
    },
  }, {
    tableName: 'issue_voucher',
    timestamps: false,
  });

  IssueVoucher.associate = models => {
    IssueVoucher.belongsTo(models.Customer, {
      foreignKey: 'customer_id',
      targetKey: 'customer_id',
    });
    IssueVoucher.belongsTo(models.VoucherUsage, {
      foreignKey: 'voucher_usage_id',
      targetKey: 'voucher_usage_id',
    });
  };

  return IssueVoucher;
};
