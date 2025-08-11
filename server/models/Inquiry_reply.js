// models/Inquiry_reply.js
module.exports = (sequelize, DataTypes) => {
  const Inquiry_reply = sequelize.define('Inquiry_reply', {
    inquiry_reply_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    inquiry_id: {
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
    is_visible: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  }, {
    tableName: 'inquiry_reply',
    timestamps: false,
  });

  Inquiry_reply.associate = (models) => {
    Inquiry_reply.belongsTo(models.Inquiry, {
      foreignKey: 'inquiry_id',
      targetKey: 'inquiry_id',
    });
  };

  return Inquiry_reply;
};
