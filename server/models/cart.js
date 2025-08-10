// server/models/cart.js
module.exports = (sequelize, DataTypes) => {
    const Cart = sequelize.define('Cart', {
        cart_id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        customer_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'cart',
        timestamps: false
    });

    Cart.associate = (models) => {
        Cart.belongsTo(models.Customer, {
            foreignKey: 'customer_id',
            as: 'customer'
        });
        Cart.hasMany(models.CartItem, {
            foreignKey: 'cart_id',
            as: 'items',
            onDelete: 'CASCADE'
        });
    };

    return Cart;
};