// backend/src/scripts/syncDatabase.js
// Run this script to sync database schema with models
// Usage: node src/scripts/syncDatabase.js

require('dotenv').config();
const { sequelize } = require('../models');

async function syncDatabase() {
    console.log('🔄 Starting database sync...\n');

    try {
        // Test connection first
        await sequelize.authenticate();
        console.log('✅ Database connection successful');
        console.log(`📦 Database: ${sequelize.config.database}`);
        console.log(`🖥️  Host: ${sequelize.config.host}:${sequelize.config.port}\n`);

        // Sync with alter: true to add new columns without dropping data
        console.log('📊 Syncing models with ALTER...');
        await sequelize.sync({ alter: true });

        console.log('\n✅ Database sync complete!');
        console.log('   New columns have been added to the complaints table:\n');
        console.log('   - categoryConfidence (FLOAT)');
        console.log('   - suggestedDistrict (STRING)');
        console.log('   - suggestedDistrictName (STRING)');
        console.log('   - needsReview (BOOLEAN)');
        console.log('   - ELECTRICITY and UNVERIFIED added to category ENUM\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Database sync failed:', error.message);
        console.error('\nFull error:', error);
        process.exit(1);
    }
}

syncDatabase();
