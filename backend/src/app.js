const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*'
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        service: 'tn-grievance-backend',
        timestamp: new Date(),
        environment: process.env.NODE_ENV
    });
});

// API Routes
app.use('/api/complaints', require('./routes/complaints'));
// Add after complaints routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/districts', require('./routes/districts'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api', require('./routes/testRoutes'));


// Error handling middleware (keep this at the end)
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production'
            ? 'Server error'
            : err.message,
        timestamp: new Date()
    });
});

module.exports = app;
