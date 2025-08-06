// models/Inquiry.js
module.exports = (sequelize, DataTypes) => {
  const Inquiry = sequelize.define('Inquiry', {
    inquiry_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    customer_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    content: {
      type: DataTypes.STRING(1000),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM(
        '회원/계정 문의',
        '주문/결제 문의',
        '배송 문의',
        '반품/교환/환불',
        '쿠폰/포인트 문의',
        '상품 문의',
        '이벤트/프로모션 문의',
        '기타 문의'
      ),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('접수', '답변 완료'),
      allowNull: false,
    },
    is_visible: {
      type: DataTypes.ENUM('공개', '비공개'),
      allowNull: false,
    },
  }, {
    tableName: 'inquiry',
    timestamps: false,
  });

  Inquiry.associate = (models) => {
    Inquiry.hasMany(models.Inquiry_reply, {
      foreignKey: 'inquiry_id',
      sourceKey: 'inquiry_id',
    });
  };

  return Inquiry;
};
