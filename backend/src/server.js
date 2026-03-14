// backend/src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 8000;

// ============================================================================
// Middleware
// ============================================================================

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'], // React dev servers
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
});

// ============================================================================
// Routes
// ============================================================================

// Import routes
const complaintsRoutes = require('./routes/complaints');
const districtsRoutes = require('./routes/districts');
const adminRoutes = require('./routes/admin');

// Use routes
app.use('/api/complaints', complaintsRoutes);
app.use('/api/districts', districtsRoutes);
app.use('/api/admin', adminRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'TN Grievance System API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            health: '/api/health',
            complaints: {
                submit: 'POST /api/complaints/submit',
                track: 'GET /api/complaints/track/:phone',
                status: 'GET /api/complaints/status/:id',
                all: 'GET /api/complaints/all'
            }
        }
    });
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        await sequelize.authenticate();

        // Get database stats
        const { User, District, Complaint } = require('./models');
        const stats = {
            users: await User.count(),
            districts: await District.count(),
            complaints: await Complaint.count(),
            activeComplaints: await Complaint.count({
                where: {
                    status: ['submitted', 'acknowledged', 'in_progress']
                }
            })
        };

        res.json({
            status: 'OK',
            database: 'Connected',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
            stats
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            database: 'Disconnected',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// ============================================================================
// Error Handling
// ============================================================================

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.path,
        method: req.method
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err);

    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ============================================================================
// Server Startup
// ============================================================================

app.listen(PORT, async () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 TN GRIEVANCE SYSTEM - BACKEND API');
    console.log('='.repeat(60));

    try {
        await sequelize.authenticate();
        console.log('✅ Database connected successfully');
        console.log(`📦 Database: ${sequelize.config.database}`);
        console.log(`🖥️  Host: ${sequelize.config.host}:${sequelize.config.port}`);
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.error('⚠️  Server running but database unavailable');
    }

    console.log('\n📡 Server Information:');
    console.log(`   Port: ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   API Base: http://localhost:${PORT}/api`);

    console.log('\n📚 Available Endpoints:');
    console.log('   GET  /api/health');
    console.log('   POST /api/complaints/submit');
    console.log('   GET  /api/complaints/track/:phone');
    console.log('   GET  /api/complaints/status/:id');
    console.log('   GET  /api/complaints/all');

    console.log('\n' + '='.repeat(60));
    console.log('✨ Server is ready to accept requests!');
    console.log('='.repeat(60) + '\n');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('\n⚠️  SIGTERM signal received: closing HTTP server');
    await sequelize.close();
    console.log('✅ Database connection closed');
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('\n⚠️  SIGINT signal received: closing HTTP server');
    await sequelize.close();
    console.log('✅ Database connection closed');
    process.exit(0);
});

module.exports = app;
