// server/models/refund.js
module.exports = (sequelize, DataTypes) => {
  const Refund = sequelize.define('Refund', {
    refund_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    payment_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    reason: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('완료', '거절', '요청됨', '승인됨'),
      allowNull: false
    },
    refunded_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'refund',
    timestamps: false,
    underscored: true
  });

  Refund.associate = (models) => {
    Refund.belongsTo(models.Payment, {
      foreignKey: 'payment_id',
      targetKey: 'payment_id'
    });
  };

  return Refund;
};
