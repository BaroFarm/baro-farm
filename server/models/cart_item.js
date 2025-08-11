// server/models/cart_item.js
module.exports = (sequelize, DataTypes) => {
    const CartItem = sequelize.define('CartItem', {
        cart_item_id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        cart_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        product_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        delivery_type: {
            type: DataTypes.ENUM('pickup', 'smart'),
            allowNull: false
        },
        add_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'cart_items',
        timestamps: false
    });

    CartItem.associate = (models) => {
        CartItem.belongsTo(models.Cart, {
            foreignKey: 'cart_id',
            as: 'cart'
        });
        CartItem.belongsTo(models.Product, {
            foreignKey: 'product_id',
            as: 'product'
        });
    };

    return CartItem;
};