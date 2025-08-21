// server/models/payment.js
module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    payment_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    order_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    pg_provider: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    method: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('성공', '실패', '취소', '처리중'),
      allowNull: false
    },
    pg_tid: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    approved_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'payment',
    timestamps: false,
    underscored: true
  });

  Payment.associate = (models) => {
    Payment.belongsTo(models.Order, {
      as: 'order',
      foreignKey: 'order_id',
      targetKey: 'order_id'
    });
    Payment.hasMany(models.Refund, {
    as: 'refunds',           // 선택(안 써도 됨)
    foreignKey: 'payment_id',
    sourceKey: 'payment_id'
  });
  };

  return Payment;
};
