// backend/src/models/Complaint.js
module.exports = (sequelize, DataTypes) => {
    const Complaint = sequelize.define('Complaint', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        // Citizen Information
        citizenName: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        citizenPhone: {
            type: DataTypes.STRING(15),
            allowNull: false
        },
        citizenEmail: {
            type: DataTypes.STRING(100),
            allowNull: true,
            validate: {
                isEmail: true
            }
        },

        // Complaint Details
        text: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        category: {
            type: DataTypes.ENUM(
                'PUBLIC_WORKS',
                'WATER_SUPPLY',
                'SANITATION',
                'HEALTH',
                'EDUCATION',
                'ELECTRICITY',
                'GENERAL',
                'UNVERIFIED'
            ),
            defaultValue: 'GENERAL'
        },
        categoryConfidence: {
            type: DataTypes.FLOAT,
            allowNull: true,
            comment: 'ML classification confidence (0-1)'
        },
        suggestedDistrict: {
            type: DataTypes.STRING(20),
            allowNull: true,
            comment: 'ML-suggested district ID'
        },
        suggestedDistrictName: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment: 'ML-suggested district name'
        },
        needsReview: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Flag for admin review queue'
        },
        districtId: {
            type: DataTypes.STRING(20),
            allowNull: false,
            references: {
                model: 'districts',
                key: 'id'
            }
        },
        latitude: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        longitude: {
            type: DataTypes.FLOAT,
            allowNull: true
        },

        // Priority & Status
        priority: {
            type: DataTypes.ENUM('CRITICAL', 'HIGH', 'MEDIUM', 'LOW'),
            defaultValue: 'MEDIUM'
        },
        priorityScore: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        slaHours: {
            type: DataTypes.INTEGER,
            defaultValue: 24
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
            defaultValue: 'submitted'
        },

        // Officer Assignment
        assignedTo: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        assignedAt: {
            type: DataTypes.DATE,
            allowNull: true
        },

        // ML Analysis
        mlUsed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        mlClassificationConfidence: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        mlLocationConfidence: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        mlResults: {
            type: DataTypes.JSON,
            allowNull: true
        },

        // Sentiment
        sentimentScore: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        urgencyScore: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        emotion: {
            type: DataTypes.STRING(50),
            allowNull: true
        },

        // Files
        audioPath: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        imagePath: {
            type: DataTypes.STRING(255),
            allowNull: true
        },

        // Voice Analysis
        voiceTranscript: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        voiceSentiment: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        voiceUrgency: {
            type: DataTypes.FLOAT,
            allowNull: true
        },

        // Image Analysis
        imageSeverity: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        imageIssues: {
            type: DataTypes.JSON,
            allowNull: true
        },

        // Resolution
        resolution: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        resolvedAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        closedAt: {
            type: DataTypes.DATE,
            allowNull: true
        },

        // Fraud Detection
        fraudScore: {
            type: DataTypes.FLOAT,
            defaultValue: 0
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
        tableName: 'complaints',
        timestamps: true,
        indexes: [
            { fields: ['citizenPhone'] },
            { fields: ['districtId'] },
            { fields: ['status'] },
            { fields: ['priority'] },
            { fields: ['assignedTo'] },
            { fields: ['createdAt'] },
            { fields: ['needsReview'] },
            { fields: ['category'] }
        ]
    });

    Complaint.associate = (models) => {
        // Complaint belongs to district
        Complaint.belongsTo(models.District, {
            foreignKey: 'districtId',
            targetKey: 'id',
            as: 'district'
        });

        // Complaint assigned to officer
        Complaint.belongsTo(models.User, {
            foreignKey: 'assignedTo',
            targetKey: 'id',
            as: 'officer'
        });

        // Complaint has status history
        Complaint.hasMany(models.StatusHistory, {
            foreignKey: 'complaintId',
            sourceKey: 'id',
            as: 'statusHistory'
        });
    };

    return Complaint;
};
