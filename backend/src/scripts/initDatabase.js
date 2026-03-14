const { sequelize, User, District, Complaint, StatusHistory } = require('../models');

async function initDatabase() {
    try {
        console.log('🔄 Starting database initialization...\n');

        await sequelize.authenticate();
        console.log('✅ Database connection established\n');

        // Disable foreign key checks for clean slate
        console.log('🔓 Disabling foreign key checks...');
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

        console.log('🗑️  Dropping existing tables...');
        await sequelize.query('DROP TABLE IF EXISTS status_history');
        await sequelize.query('DROP TABLE IF EXISTS complaints');
        await sequelize.query('DROP TABLE IF EXISTS users');
        await sequelize.query('DROP TABLE IF EXISTS districts');
        console.log('✅ Tables dropped\n');

        // Re-enable foreign key checks
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('🔒 Foreign key checks re-enabled\n');

        console.log('🔨 Creating tables...');
        await District.sync({ force: true });
        console.log('  ✅ Districts table created');

        await User.sync({ force: true });
        console.log('  ✅ Users table created');

        await Complaint.sync({ force: true });
        console.log('  ✅ Complaints table created');

        await StatusHistory.sync({ force: true });
        console.log('  ✅ Status History table created');

        console.log('✅ All tables created\n');

        // Seed Districts - All 38 Tamil Nadu Districts (IDs match ML service districts.json)
        console.log('📍 Seeding all 38 Tamil Nadu districts...');
        const districts = [
            { id: 'TN_CHN_001', name: 'Chennai', tier: 'tier1', population: 7088000, latitude: 13.0827, longitude: 80.2707 },
            { id: 'TN_MDU_001', name: 'Madurai', tier: 'tier1', population: 3100000, latitude: 9.9252, longitude: 78.1198 },
            { id: 'TN_CBE_001', name: 'Coimbatore', tier: 'tier1', population: 3470000, latitude: 11.0168, longitude: 76.9558 },
            { id: 'TN_SLM_001', name: 'Salem', tier: 'tier1', population: 3480000, latitude: 11.6643, longitude: 78.146 },
            { id: 'TN_TIR_001', name: 'Tiruchirappalli', tier: 'tier1', population: 3100000, latitude: 10.7905, longitude: 78.7047 },
            { id: 'TN_TNV_001', name: 'Tirunelveli', tier: 'tier1', population: 3400000, latitude: 8.7139, longitude: 77.7568 },
            { id: 'TN_TNK_001', name: 'Thanjavur', tier: 'tier2', population: 2800000, latitude: 10.7799, longitude: 79.1315 },
            { id: 'TN_ERD_001', name: 'Erode', tier: 'tier2', population: 2700000, latitude: 11.341, longitude: 77.7155 },
            { id: 'TN_VRI_001', name: 'Virudhunagar', tier: 'tier2', population: 2200000, latitude: 9.5836, longitude: 77.9624 },
            { id: 'TN_TUT_001', name: 'Thoothukudi', tier: 'tier2', population: 2100000, latitude: 8.8057, longitude: 78.1348 },
            { id: 'TN_VPM_001', name: 'Viluppuram', tier: 'tier2', population: 4200000, latitude: 11.9398, longitude: 79.4305 },
            { id: 'TN_KNY_001', name: 'Kanyakumari', tier: 'tier2', population: 2000000, latitude: 8.0883, longitude: 77.5399 },
            { id: 'TN_NLK_001', name: 'Nilgiris', tier: 'tier3', population: 800000, latitude: 11.4113, longitude: 76.6962 },
            { id: 'TN_VLR_001', name: 'Vellore', tier: 'tier2', population: 2100000, latitude: 12.9165, longitude: 79.1325 },
            { id: 'TN_KPM_001', name: 'Kancheepuram', tier: 'tier2', population: 2400000, latitude: 12.8412, longitude: 79.7658 },
            { id: 'TN_TVR_001', name: 'Thiruvallur', tier: 'tier1', population: 4000000, latitude: 13.1423, longitude: 80.1307 },
            { id: 'TN_DGL_001', name: 'Dindigul', tier: 'tier2', population: 2700000, latitude: 10.3667, longitude: 77.9833 },
            { id: 'TN_KRR_001', name: 'Karur', tier: 'tier3', population: 1400000, latitude: 10.958, longitude: 78.0784 },
            { id: 'TN_PDK_001', name: 'Pudukkottai', tier: 'tier2', population: 1700000, latitude: 10.5207, longitude: 78.8212 },
            { id: 'TN_TNI_001', name: 'Theni', tier: 'tier3', population: 1500000, latitude: 9.9766, longitude: 77.4774 },
            { id: 'TN_RAM_001', name: 'Ramanathapuram', tier: 'tier3', population: 1600000, latitude: 9.3595, longitude: 78.9289 },
            { id: 'TN_SGV_001', name: 'Sivaganga', tier: 'tier3', population: 1600000, latitude: 10.0824, longitude: 78.5582 },
            { id: 'TN_PRL_001', name: 'Perambalur', tier: 'tier3', population: 600000, latitude: 11.1156, longitude: 79.0741 },
            { id: 'TN_ARL_001', name: 'Ariyalur', tier: 'tier3', population: 800000, latitude: 11.1033, longitude: 79.2083 },
            { id: 'TN_NGK_001', name: 'Nagapattinam', tier: 'tier3', population: 1800000, latitude: 10.7905, longitude: 79.8426 },
            { id: 'TN_TAR_001', name: 'Thiruvarur', tier: 'tier3', population: 1400000, latitude: 10.7459, longitude: 79.6374 },
            { id: 'TN_NMK_001', name: 'Namakkal', tier: 'tier2', population: 1900000, latitude: 11.2234, longitude: 78.1651 },
            { id: 'TN_DMP_001', name: 'Dharmapuri', tier: 'tier3', population: 2000000, latitude: 12.1309, longitude: 78.1564 },
            { id: 'TN_KRG_001', name: 'Krishnagiri', tier: 'tier2', population: 2200000, latitude: 12.5318, longitude: 78.2087 },
            { id: 'TN_TPT_001', name: 'Tirupathur', tier: 'tier3', population: 1700000, latitude: 12.491, longitude: 78.5667 },
            { id: 'TN_RNT_001', name: 'Ranipet', tier: 'tier3', population: 2000000, latitude: 12.9605, longitude: 79.3325 },
            { id: 'TN_KLC_001', name: 'Kallakurichi', tier: 'tier3', population: 2000000, latitude: 11.4255, longitude: 78.9651 },
            { id: 'TN_MLD_001', name: 'Mayiladuthurai', tier: 'tier3', population: 1900000, latitude: 11.0921, longitude: 79.6505 },
            { id: 'TN_TNK_002', name: 'Tenkasi', tier: 'tier3', population: 1800000, latitude: 8.9531, longitude: 77.3143 },
            { id: 'TN_TUP_001', name: 'Tiruppur', tier: 'tier2', population: 3100000, latitude: 11.1085, longitude: 77.3327 },
            { id: 'TN_TVM_001', name: 'Tiruvannamalai', tier: 'tier2', population: 2400000, latitude: 12.2269, longitude: 79.0651 },
            { id: 'TN_CDL_001', name: 'Cuddalore', tier: 'tier2', population: 2800000, latitude: 11.7483, longitude: 79.7667 },
            { id: 'TN_CPT_001', name: 'Chengalpattu', tier: 'tier2', population: 2500000, latitude: 12.6817, longitude: 80.1252 },
        ];

        await District.bulkCreate(districts);
        console.log(`✅ ${districts.length} districts seeded\n`);

        // Seed Admin User (no district required)
        console.log('👤 Creating admin user...');
        const admin = await User.create({
            name: 'System Admin',
            email: 'admin@tngov.in',
            phone: '9876543210',
            password: 'Admin@123',
            role: 'admin',
            isActive: true
        });
        console.log(`✅ Admin created: ${admin.email} (password: Admin@123)\n`);

        // Seed Test Citizen (no district required)
        console.log('👤 Creating test citizen...');
        await User.create({
            name: 'Test Citizen',
            email: 'citizen@test.com',
            phone: '9999999999',
            password: 'Citizen@123',
            role: 'citizen',
            isActive: true
        });
        console.log('✅ Test citizen created: citizen@test.com (password: Citizen@123)\n');

        // Seed District Officers (with valid districtIds matching ML service)
        console.log('👮 Creating district officers...');
        const officers = [
            {
                name: 'Rajesh Kumar',
                email: 'officer.chennai@tngov.in',
                phone: '9876543211',
                password: 'Officer@123',
                role: 'officer',
                districtId: 'TN_CHN_001',  // Chennai
                department: 'PUBLIC_WORKS'
            },
            {
                name: 'Priya Sharma',
                email: 'officer.madurai@tngov.in',
                phone: '9876543212',
                password: 'Officer@123',
                role: 'officer',
                districtId: 'TN_MDU_001',  // Madurai (matches ML service)
                department: 'PUBLIC_WORKS'
            },
            {
                name: 'Karthik Raj',
                email: 'officer.coimbatore@tngov.in',
                phone: '9876543213',
                password: 'Officer@123',
                role: 'officer',
                districtId: 'TN_CBE_001',  // Coimbatore
                department: 'WATER_SUPPLY'
            },
            {
                name: 'Anitha Devi',
                email: 'officer.trichy@tngov.in',
                phone: '9876543214',
                password: 'Officer@123',
                role: 'officer',
                districtId: 'TN_TIR_001',  // Tiruchirappalli (matches ML service)
                department: 'SANITATION'
            },
            {
                name: 'Murugan S',
                email: 'officer.salem@tngov.in',
                phone: '9876543215',
                password: 'Officer@123',
                role: 'officer',
                districtId: 'TN_SLM_001',  // Salem
                department: 'HEALTH'
            }
        ];

        await User.bulkCreate(officers);
        console.log(`✅ ${officers.length} officers created\n`);

        console.log('📊 DATABASE INITIALIZATION COMPLETE!\n');
        console.log('='.repeat(60));
        console.log('LOGIN CREDENTIALS:\n');
        console.log('🔑 Admin:');
        console.log('   Email: admin@tngov.in');
        console.log('   Password: Admin@123\n');
        console.log('👤 Test Citizen:');
        console.log('   Email: citizen@test.com');
        console.log('   Password: Citizen@123\n');
        console.log('👮 Officers:');
        console.log('   officer.chennai@tngov.in (Chennai - PUBLIC_WORKS)');
        console.log('   officer.madurai@tngov.in (Madurai - PUBLIC_WORKS)');
        console.log('   officer.coimbatore@tngov.in (Coimbatore - WATER_SUPPLY)');
        console.log('   officer.trichy@tngov.in (Tiruchirappalli - SANITATION)');
        console.log('   officer.salem@tngov.in (Salem - HEALTH)');
        console.log('   Password: Officer@123\n');
        console.log('📱 Citizen Tracking:');
        console.log('   Citizens track complaints using phone number');
        console.log('   No registration required!\n');
        console.log('📍 Districts: 38 Tamil Nadu districts loaded\n');
        console.log('='.repeat(60));

        process.exit(0);

    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

initDatabase();
