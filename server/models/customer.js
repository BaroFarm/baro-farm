module.exports = (sequelize, DataTypes) => {
const Customer = sequelize.define('Customer', {
    customer_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    user_type: {
      type: DataTypes.ENUM('buyer', 'seller'),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    nickname: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    zip_code: { // 우편번호
      type: DataTypes.STRING(20),
      allowNull: false
    },
    street: { // 도로명주소
      type: DataTypes.STRING(100),
      allowNull: false
    },
    detail: { //상세주소
      type: DataTypes.STRING(100),
      allowNull: true
    },
    profile_image: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('활성', '비활성', '탈퇴'),
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'customer',
    timestamps: false
  });

  return Customer;
};
