// src/routes/districts.js
const express = require('express');
const { District } = require('../models');
const router = express.Router();

/**
 * GET /api/districts
 * Get all districts
 */
router.get('/', async (req, res) => {
    try {
        const districts = await District.findAll({
            order: [['name', 'ASC']],
            attributes: ['id', 'name', 'tier', 'population', 'latitude', 'longitude']
        });

        res.json({
            success: true,
            count: districts.length,
            data: districts
        });
    } catch (error) {
        console.error('❌ Get districts error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch districts'
        });
    }
});

/**
 * GET /api/districts/:id
 * Get district by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const district = await District.findByPk(req.params.id);

        if (!district) {
            return res.status(404).json({
                success: false,
                error: 'District not found'
            });
        }

        res.json({
            success: true,
            data: district
        });
    } catch (error) {
        console.error('❌ Get district error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch district'
        });
    }
});

module.exports = router;
