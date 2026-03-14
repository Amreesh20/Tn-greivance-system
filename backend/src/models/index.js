// backend/src/models/index.js
const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Initialize Sequelize
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging || false,
    timezone: dbConfig.timezone || '+05:30',
    pool: dbConfig.pool || {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Import models (use exact filenames from your structure)
const User = require('./User')(sequelize, Sequelize.DataTypes);
const District = require('./District')(sequelize, Sequelize.DataTypes);
const Complaint = require('./Complaint')(sequelize, Sequelize.DataTypes);
const StatusHistory = require('./statusHistory')(sequelize, Sequelize.DataTypes);

// Define associations
const models = { User, District, Complaint, StatusHistory };

Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Export sequelize instance and models
module.exports = {
  sequelize,
  Sequelize,
  User,
  District,
  Complaint,
  StatusHistory
};
