module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define('Product', {
        product_id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        category_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        seller_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        direct_store_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('판매중', '품절', '판매중지'),
            allowNull: false
        },
        weight: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        price: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        intro: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        is_video: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        video_url: {
            type: DataTypes.STRING(500),
            allowNull: true
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        returnable: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    }, {
        tableName: 'product',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    Product.associate = models => {
        Product.belongsTo(models.Category, {
            foreignKey: 'category_id',
            targetKey: 'category_id',
            as: 'category'
        });

        Product.belongsTo(models.DirectStore, {
            foreignKey: 'direct_store_id',
            targetKey: 'direct_store_id',
            as: 'direct_store'
        });
        
        Product.belongsTo(models.Seller, {
            foreignKey: 'seller_id',
            targetKey: 'seller_id',
            as: 'seller'
        });
    };

    return Product;
};
