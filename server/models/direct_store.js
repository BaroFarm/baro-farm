// server/models/direct_store.js
module.exports = (sequelize, DataTypes) => {
  const DirectStore = sequelize.define('DirectStore', {
    direct_store_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    seller_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
    }
  }, {
    tableName: 'direct_store',
    modelName: 'DirectStore', // ✅ 이걸 꼭 써주세요
    timestamps: false,
    underscored: true,
  });

  DirectStore.associate = (models) => {
    DirectStore.belongsTo(models.Seller, {
      foreignKey: 'seller_id',
      targetKey: 'seller_id',
    });

    DirectStore.hasMany(models.Product, {
      foreignKey: 'direct_store_id',
      sourceKey: 'direct_store_id',
    });
  };

  return DirectStore;
};
