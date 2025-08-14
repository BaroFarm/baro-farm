// server/models/ProductImage.js
module.exports = (sequelize, DataTypes) => {
  const ProductImage = sequelize.define(
    'ProductImage',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      product_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      // 라우터에서 사용 중인 필드명과 1:1 매칭
      img_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      img_url: {
        type: DataTypes.STRING(1024),
        allowNull: false,
      },
      img_order: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 1,
      },
    },
    {
      tableName: 'product_images',
      timestamps: false, // createdAt, updatedAt
      paranoid: false,
      createdAt: false,   // ✅
      updatedAt: false,   // ✅
      indexes: [
        { fields: ['product_id'] },
        { fields: ['img_order'] },
      ],
    }
  );

  // 관계 필요시:
  // ProductImage.associate = (models) => {
  //   ProductImage.belongsTo(models.Product, {
  //     foreignKey: 'product_id',
  //     as: 'product',
  //   });
  // };

  return ProductImage;
};
