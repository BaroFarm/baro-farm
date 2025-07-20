// server/models/seller.js
module.exports = (sequelize, DataTypes) => {
  const Seller = sequelize.define('Seller', {
    seller_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    store_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    user_type: {
      type: DataTypes.ENUM('buyer', 'seller'),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    business_number: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    contact: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('활성', '비활성', '탈퇴'),
      allowNull: false,
    }
  }, {
    tableName: 'seller',
    timestamps: false,
    underscored: true,
  });

  Seller.associate = (models) => {
    Seller.belongsTo(models.Store, {
      foreignKey: 'store_id',
      targetKey: 'store_id',
    });

    // Seller.hasMany(models.DirectStore, {
    //   foreignKey: 'seller_id',
    //   sourceKey: 'seller_id',
    // });

    // Seller.hasMany(models.Product, {
    //   foreignKey: 'seller_id',
    //   sourceKey: 'seller_id',
    // });

  };

  return Seller;
};