// server/models/product.js
module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    product_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    category_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    seller_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    direct_store_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('판매중', '품절', '판매 중지'),
      allowNull: false,
    },
    weight: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    intro: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    figma_export_url: {
      type: DataTypes.STRING(1024),
      allowNull: false,
    },
    is_video: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    video_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    returnable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    regular_delivery: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  }, {
    tableName: 'product',
    timestamps: false,
    underscored: true,
  });

  Product.associate = (models) => {
    // Category 관계
    Product.belongsTo(models.Category, {
      foreignKey: 'category_id',
      targetKey: 'category_id',
      as: 'category',
    });

    // Seller 관계
    Product.belongsTo(models.Seller, {
      foreignKey: 'seller_id',
      targetKey: 'seller_id',
      as: 'seller', 
    });

    // DirectStore 관계
    Product.belongsTo(models.DirectStore, {
      foreignKey: 'direct_store_id',
      targetKey: 'direct_store_id',
      as: 'direct_store',
    });

    // ProductImg 관계
    Product.hasMany(models.ProductImg, {
      foreignKey: 'product_id',
      sourceKey: 'product_id',
    });

    // OrderProduct 관계 추가
    Product.hasMany(models.OrderProduct, {
      foreignKey: 'product_id',
      sourceKey: 'product_id',
    });


    Product.hasMany(models.Inquiry, {
      foreignKey: 'product_id',
      sourceKey: 'product_id',
    });

  };

  return Product;
};