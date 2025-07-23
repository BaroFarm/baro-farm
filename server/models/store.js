// server/models/store.js
module.exports = (sequelize, DataTypes) => {
  const Store = sequelize.define('Store', {
    store_id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    zip_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    street: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    detail: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    }
  }, {
    tableName: 'store',
    timestamps: false,
    underscored: true,
  });

    Store.associate = (models) => { // seller 테이블 외래키 설정
    Store.hasMany(models.Seller, {
      foreignKey: 'store_id',
      sourceKey: 'store_id',
    });
  };

  return Store;
};
