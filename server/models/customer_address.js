// server/models/customer_address.js
module.exports = (sequelize, DataTypes) => {
  const CustomerAddress = sequelize.define('CustomerAddress', {
    address_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    customer_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'customer',
        key: 'customer_id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    address_line: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'customer_address',
    timestamps: false,
    underscored: true,
  });

  CustomerAddress.associate = (models) => {
    CustomerAddress.belongsTo(models.Customer, {
      foreignKey: 'customer_id',
      targetKey: 'customer_id',
    });
  };

  return CustomerAddress;
};
