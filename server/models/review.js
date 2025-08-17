// server/models/review.js
module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define('Review', {
    review_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    customer_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    content: {
      type: DataTypes.STRING(1000),
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    img_url: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    created_date: {
      type: DataTypes.DATE,
      allowNull: false,
    }
  }, {
    tableName: 'review',
    timestamps: false,
    underscored: true,
  });

  Review.associate = (models) => {
    Review.belongsTo(models.Customer, {
      foreignKey: 'customer_id',
      targetKey: 'customer_id',
    });
    Review.belongsTo(models.Product, {
      foreignKey: 'product_id',
      targetKey: 'product_id',
    });
  };

  return Review;
};
