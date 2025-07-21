module.exports = (sequelize, DataTypes) => {
    const Category = sequelize.define('Category', {
        category_id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        category_name: {
            type: DataTypes.STRING(100),
            allowNull: false
        }
    }, {
        tableName: 'category',
        timestamps: false
    });

    return Category;
};
