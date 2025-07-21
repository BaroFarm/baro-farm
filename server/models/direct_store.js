module.exports = (sequelize, DataTypes) => {
    const DirectStore = sequelize.define('DirectStore', {
        direct_store_id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        seller_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        latitude: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        longitude: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
        }
    }, {
        tableName: 'direct_store',
        timestamps: false, 
        createdAt: 'created_at',
        updatedAt: false
    });

    DirectStore.associate = models => {
        DirectStore.belongsTo(models.Seller, {
            foreignKey: 'seller_id',
            targetKey: 'seller_id',
            as: 'seller'
        });

        DirectStore.hasMany(models.Product, {
            foreignKey: 'direct_store_id',
            as: 'product'
        });
    };

    return DirectStore;
    };
