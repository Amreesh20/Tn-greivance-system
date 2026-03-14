// backend/src/models/District.js
module.exports = (sequelize, DataTypes) => {
    const District = sequelize.define('District', {
        id: {
            type: DataTypes.STRING(20),
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
        tier: {
            type: DataTypes.ENUM('tier1', 'tier2', 'tier3'),
            allowNull: false
        },
        population: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        area: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        headquarters: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        latitude: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        longitude: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'districts',
        timestamps: true
    });

    District.associate = (models) => {
        // District has many complaints
        District.hasMany(models.Complaint, {
            foreignKey: 'districtId',
            sourceKey: 'id',
            as: 'complaints'
        });

        // District has many officers (users)
        District.hasMany(models.User, {
            foreignKey: 'districtId',
            sourceKey: 'id',
            as: 'officers'
        });
    };

    return District;
};
