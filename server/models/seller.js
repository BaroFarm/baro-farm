// server/models/seller.js
module.exports = (sequelize, DataTypes) => {
  const Seller = sequelize.define('Seller', {
    seller_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    store_id: { // store 테이블 외래키 참조
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'store', 
        key: 'store_id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    user_type: {
      type: DataTypes.ENUM('buyer', 'seller'),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
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
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    license_number: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    contact: { // 고객 응대 연락처
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    verified: { // 신원 인증 여부
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
    },
  }, {
    tableName: 'seller',
    timestamps: false,
    underscored: true,
  });

  return Seller;
};
