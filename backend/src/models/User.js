// backend/src/models/User.js
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        phone: {
            type: DataTypes.STRING(15),
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        role: {
            type: DataTypes.ENUM('officer', 'admin'),
            defaultValue: 'officer',
            allowNull: false
        },
        districtId: {
            type: DataTypes.STRING(20),
            allowNull: true,
            references: {
                model: 'districts',
                key: 'id'
            }
        },
        department: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        lastLogin: {
            type: DataTypes.DATE,
            allowNull: true
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
        tableName: 'users',
        timestamps: true,
        hooks: {
            beforeCreate: async (user) => {
                if (user.password) {
                    user.password = await bcrypt.hash(user.password, 10);
                }
            },
            beforeUpdate: async (user) => {
                if (user.changed('password')) {
                    user.password = await bcrypt.hash(user.password, 10);
                }
            }
        }
    });

    User.prototype.validatePassword = async function (password) {
        // For officers with plain text passwords, do direct comparison
        if (this.role === 'officer' && !this.password.startsWith('$2')) {
            return password === this.password;
        }
        // For bcrypt hashed passwords (starts with $2a$, $2b$, etc.)
        if (this.password.startsWith('$2')) {
            return await bcrypt.compare(password, this.password);
        }
        // Fallback: plain text comparison for any non-hashed password
        return password === this.password;
    };

    User.prototype.toJSON = function () {
        const values = { ...this.get() };
        delete values.password;
        return values;
    };

    User.associate = (models) => {
        // User (officer) handles many complaints
        User.hasMany(models.Complaint, {
            foreignKey: 'assignedTo',
            sourceKey: 'id',
            as: 'assignedComplaints'
        });

        // User belongs to district
        User.belongsTo(models.District, {
            foreignKey: 'districtId',
            targetKey: 'id',
            as: 'district'
        });
    };

    return User;
};
