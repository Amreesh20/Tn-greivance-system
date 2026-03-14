const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, password, role = 'citizen', districtId } = req.body;

        // Validate input
        if (!name || !email || !phone || !password) {
            return res.status(400).json({
                error: 'Name, email, phone, and password are required',
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({
            where: { email }
        });

        if (existingUser) {
            return res.status(409).json({
                error: 'User already exists with this email',
            });
        }

        // Create user (password will be hashed by model hooks)
        const user = await User.create({
            name,
            email,
            phone,
            password,
            role,
            districtId,
        });

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    districtId: user.districtId,
                },
                token,
            },
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            error: 'Registration failed',
        });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: 'Email and password required',
            });
        }

        // Find user with district info
        const user = await User.findOne({
            where: { email },
            include: [{
                model: require('../models').District,
                as: 'district',
                attributes: ['id', 'name']
            }]
        });
        if (!user || !user.isActive) {
            return res.status(401).json({
                error: 'Invalid credentials',
            });
        }

        // Check password using model method
        const isValidPassword = await user.validatePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({
                error: 'Invalid credentials',
            });
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    districtId: user.districtId,
                    department: user.department,
                    district: user.district,
                },
                token,
            },
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Login failed',
        });
    }
});

// GET /api/auth/profile
router.get('/profile', async (req, res) => {
    // This will be protected by JWT middleware later
    res.json({
        message: 'Profile endpoint (JWT protected)',
    });
});

module.exports = router;
