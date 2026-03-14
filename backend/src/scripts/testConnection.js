// backend/src/scripts/testConnection.js
const { sequelize } = require('../models');

async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection successful!');
        console.log(`📦 Database: ${sequelize.config.database}`);
        console.log(`🖥️  Host: ${sequelize.config.host}:${sequelize.config.port}`);
        console.log(`👤 User: ${sequelize.config.username}`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Unable to connect to database:', error.message);
        process.exit(1);
    }
}

testConnection();
