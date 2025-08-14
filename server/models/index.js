// server/models/index.js
const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const DB_NAME = process.env.DB_NAME || 'database_development';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASS || '';
const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_DIALECT = process.env.DB_DIALECT || 'mysql';

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  dialect: DB_DIALECT,
  logging: false,
  timezone: '+09:00',
  define: {
    underscored: false,
    freezeTableName: false,
  },
});

// 🔹 모델 로드 (라우터 require 금지!)
const ProductImage = require('./ProductImage')(sequelize, DataTypes);

// 🔹 관계가 있다면 여기서만 설정 (예: Product ↔ ProductImage)
// const Product = require('./Product')(sequelize, DataTypes);
// Product.hasMany(ProductImage, { foreignKey: 'product_id', as: 'images' });
// ProductImage.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

async function init() {
  try {
    await sequelize.authenticate();
    console.log('✅ DB connected');
    // 개발 중 스키마 자동 동기화가 필요하면 사용:
    // await sequelize.sync({ alter: false });
  } catch (err) {
    console.error('❌ DB connection failed:', err.message);
  }
}
init();

module.exports = {
  sequelize,
  Sequelize,
  ProductImage,
  // Product,
};
