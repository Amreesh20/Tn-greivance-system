// backend/src/models/statusHistory.js
module.exports = (sequelize, DataTypes) => {
    const StatusHistory = sequelize.define('StatusHistory', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        complaintId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'complaints',
                key: 'id'
            }
        },
        status: {
            type: DataTypes.ENUM(
                'submitted',
                'acknowledged',
                'in_progress',
                'resolved',
                'rejected',
                'closed'
            ),
            allowNull: false
        },
        changedBy: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'status_history',
        timestamps: false,
        indexes: [
            { fields: ['complaintId'] },
            { fields: ['createdAt'] }
        ]
    });

    StatusHistory.associate = (models) => {
        StatusHistory.belongsTo(models.Complaint, {
            foreignKey: 'complaintId',
            targetKey: 'id',
            as: 'complaint'
        });

        StatusHistory.belongsTo(models.User, {
            foreignKey: 'changedBy',
            targetKey: 'id',
            as: 'user'
        });
    };

    return StatusHistory;
};
