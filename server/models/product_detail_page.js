module.exports = (sequelize, DataTypes) => {
    const ProductDetailPage = sequelize.define(
      "ProductDetailPage",
      {
        page_id: {
          type: DataTypes.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        product_id: {
          type: DataTypes.BIGINT,
          allowNull: false,
        },
        figma_file_key: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        figma_export_url: {
          type: DataTypes.STRING(500),
          allowNull: true,
        },
        page_status: {
          type: DataTypes.ENUM("생성중", "완료", "실패"),
          defaultValue: "생성중",
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        tableName: "product_detail_page",
        timestamps: false,
        underscored: true,
      }
    );
  
    ProductDetailPage.associate = (models) => {
      ProductDetailPage.belongsTo(models.Product, {
        foreignKey: "product_id",
        targetKey: "product_id",
      });
    };
  
    return ProductDetailPage;
  };  