// backend/src/routes/admin.js
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Complaint, User, District, StatusHistory } = require('../models');

// ============================================================================
// MIDDLEWARE
// ============================================================================

/**
 * Admin authentication middleware
 */
const requireAdmin = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // For development, allow access with a special header
        if (req.headers['x-admin-bypass'] === 'dev') {
            req.user = { id: 1, role: 'admin', name: 'Dev Admin' };
            return next();
        }
        return res.status(401).json({ error: 'Authorization required' });
    }

    try {
        const token = authHeader.split(' ')[1];

        // Decode the token (format: base64 of 'userId:email:timestamp')
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        const [userId, email, timestamp] = decoded.split(':');

        if (!userId || !email) {
            return res.status(401).json({ error: 'Invalid token format' });
        }

        // Get the actual user from database
        const user = await User.findOne({
            where: {
                id: parseInt(userId),
                email: email,
                role: { [Op.in]: ['admin', 'officer'] },
                isActive: true
            },
            include: [{
                model: District,
                as: 'district',
                attributes: ['id', 'name']
            }]
        });

        if (!user) {
            return res.status(401).json({ error: 'User not found or inactive' });
        }

        req.user = {
            id: user.id,
            role: user.role,
            name: user.name,
            email: user.email,
            department: user.department,
            districtId: user.districtId,
            district: user.district
        };
        next();
    } catch (error) {
        console.error('Auth error:', error);
        return res.status(401).json({ error: 'Invalid token' });
    }
};


// ============================================================================
// ROUTES
// ============================================================================

/**
 * POST /api/admin/login
 * Admin/Officer login with email and password
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        // Find user with admin or officer role
        const user = await User.findOne({
            where: {
                email,
                role: { [Op.in]: ['admin', 'officer'] },
                isActive: true
            },
            include: [{
                model: District,
                as: 'district',
                attributes: ['id', 'name']
            }]
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Validate password using bcrypt
        const isValidPassword = await user.validatePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Update last login
        await user.update({ lastLogin: new Date() });

        // Return user data (in production, return JWT token)
        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                district: user.district,
                phone: user.phone
            },
            // For development, return a simple token
            token: Buffer.from(`${user.id}:${user.email}:${Date.now()}`).toString('base64')
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed'
        });
    }
});


/**
 * GET /api/admin/stats
 * Dashboard KPI statistics
 */
router.get('/stats', requireAdmin, async (req, res) => {
    try {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Total counts
        const [
            totalComplaints,
            pendingReview,
            inProgress,
            resolved,
            critical,
            todayCount,
            weekCount
        ] = await Promise.all([
            Complaint.count(),
            Complaint.count({ where: { needsReview: true } }),
            Complaint.count({ where: { status: 'in_progress' } }),
            Complaint.count({ where: { status: { [Op.in]: ['resolved', 'closed'] } } }),
            Complaint.count({ where: { priority: 'CRITICAL' } }),
            Complaint.count({ where: { createdAt: { [Op.gte]: today } } }),
            Complaint.count({ where: { createdAt: { [Op.gte]: thisWeek } } })
        ]);

        // Category distribution
        const categoryStats = await Complaint.findAll({
            attributes: [
                'category',
                [require('sequelize').fn('COUNT', 'id'), 'count']
            ],
            group: ['category'],
            raw: true
        });

        // Status distribution
        const statusStats = await Complaint.findAll({
            attributes: [
                'status',
                [require('sequelize').fn('COUNT', 'id'), 'count']
            ],
            group: ['status'],
            raw: true
        });

        // Priority distribution
        const priorityStats = await Complaint.findAll({
            attributes: [
                'priority',
                [require('sequelize').fn('COUNT', 'id'), 'count']
            ],
            group: ['priority'],
            raw: true
        });

        // District distribution (top 10)
        const districtStats = await Complaint.findAll({
            attributes: [
                'districtId',
                [require('sequelize').fn('COUNT', 'id'), 'count']
            ],
            include: [{
                model: District,
                as: 'district',
                attributes: ['name']
            }],
            group: ['districtId', 'district.id', 'district.name'],
            order: [[require('sequelize').fn('COUNT', 'id'), 'DESC']],
            limit: 10,
            raw: true,
            nest: true
        });

        // Officer workload
        const officerWorkload = await Complaint.findAll({
            attributes: [
                'assignedTo',
                [require('sequelize').fn('COUNT', 'id'), 'count']
            ],
            where: {
                assignedTo: { [Op.ne]: null },
                status: { [Op.in]: ['acknowledged', 'in_progress'] }
            },
            include: [{
                model: User,
                as: 'officer',
                attributes: ['name', 'department']
            }],
            group: ['assignedTo', 'officer.id', 'officer.name', 'officer.department'],
            order: [[require('sequelize').fn('COUNT', 'id'), 'DESC']],
            limit: 10,
            raw: true,
            nest: true
        });

        res.json({
            success: true,
            stats: {
                total: totalComplaints,
                pendingReview,
                inProgress,
                resolved,
                critical,
                todayCount,
                weekCount,
                resolutionRate: totalComplaints > 0
                    ? Math.round((resolved / totalComplaints) * 100)
                    : 0
            },
            distributions: {
                byCategory: categoryStats,
                byStatus: statusStats,
                byPriority: priorityStats,
                byDistrict: districtStats,
                officerWorkload
            }
        });

    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

/**
 * GET /api/admin/officer/stats
 * Officer-specific dashboard statistics (only complaints assigned to this officer)
 */
router.get('/officer/stats', requireAdmin, async (req, res) => {
    try {
        const officerId = req.user.id;

        // Filter for this officer's assigned complaints
        const baseWhere = { assignedTo: officerId };

        // Total counts by status for this officer
        const [
            totalAssigned,
            inProgress,
            resolved,
            critical,
            acknowledged
        ] = await Promise.all([
            Complaint.count({ where: baseWhere }),
            Complaint.count({ where: { ...baseWhere, status: 'in_progress' } }),
            Complaint.count({ where: { ...baseWhere, status: { [Op.in]: ['resolved', 'closed'] } } }),
            Complaint.count({ where: { ...baseWhere, priority: 'CRITICAL' } }),
            Complaint.count({ where: { ...baseWhere, status: 'acknowledged' } })
        ]);

        // Priority breakdown for this officer
        const priorityStats = await Complaint.findAll({
            attributes: [
                'priority',
                [require('sequelize').fn('COUNT', 'id'), 'count']
            ],
            where: baseWhere,
            group: ['priority'],
            raw: true
        });

        // Status breakdown for this officer
        const statusStats = await Complaint.findAll({
            attributes: [
                'status',
                [require('sequelize').fn('COUNT', 'id'), 'count']
            ],
            where: baseWhere,
            group: ['status'],
            raw: true
        });

        res.json({
            success: true,
            stats: {
                total: totalAssigned,
                inProgress,
                resolved,
                critical,
                acknowledged,
                pendingReview: 0, // Officers don't have pending review
                resolutionRate: totalAssigned > 0
                    ? Math.round((resolved / totalAssigned) * 100)
                    : 0
            },
            distributions: {
                byPriority: priorityStats,
                byStatus: statusStats
            },
            officer: {
                id: req.user.id,
                name: req.user.name,
                department: req.user.department,
                district: req.user.district
            }
        });

    } catch (error) {
        console.error('Officer stats error:', error);
        res.status(500).json({ error: 'Failed to fetch officer statistics' });
    }
});

/**
 * GET /api/admin/pending
 * Get complaints needing admin review (UNVERIFIED or needsReview=true)
 */
router.get('/pending', requireAdmin, async (req, res) => {
    try {
        const { limit = 20, offset = 0, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;

        const complaints = await Complaint.findAndCountAll({
            where: {
                [Op.or]: [
                    { needsReview: true },
                    { category: 'UNVERIFIED' }
                ]
            },
            include: [
                {
                    model: District,
                    as: 'district',
                    attributes: ['id', 'name']
                },
                {
                    model: User,
                    as: 'officer',
                    attributes: ['id', 'name', 'department']
                }
            ],
            order: [[sortBy, sortOrder]],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            count: complaints.count,
            data: complaints.rows,
            pagination: {
                total: complaints.count,
                limit: parseInt(limit),
                offset: parseInt(offset),
                pages: Math.ceil(complaints.count / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Pending complaints error:', error);
        res.status(500).json({ error: 'Failed to fetch pending complaints' });
    }
});

/**
 * GET /api/admin/officers
 * List officers with optional filters
 */
router.get('/officers', requireAdmin, async (req, res) => {
    try {
        const { department, districtId, isActive = true, limit = 50, offset = 0 } = req.query;

        const where = { role: 'officer' };

        if (department) where.department = department;
        if (districtId) where.districtId = districtId;
        if (isActive !== undefined) where.isActive = isActive === 'true';

        const officers = await User.findAndCountAll({
            where,
            attributes: ['id', 'name', 'email', 'phone', 'department', 'districtId', 'isActive', 'lastLogin'],
            include: [{
                model: District,
                as: 'district',
                attributes: ['id', 'name']
            }],
            order: [['name', 'ASC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        // Get workload for each officer
        const officerIds = officers.rows.map(o => o.id);
        const workloadCounts = await Complaint.findAll({
            attributes: [
                'assignedTo',
                [require('sequelize').fn('COUNT', 'id'), 'activeCount']
            ],
            where: {
                assignedTo: { [Op.in]: officerIds },
                status: { [Op.in]: ['acknowledged', 'in_progress'] }
            },
            group: ['assignedTo'],
            raw: true
        });

        const workloadMap = {};
        workloadCounts.forEach(w => {
            workloadMap[w.assignedTo] = parseInt(w.activeCount);
        });

        // Add workload to officers
        const officersWithWorkload = officers.rows.map(officer => ({
            ...officer.toJSON(),
            currentWorkload: workloadMap[officer.id] || 0
        }));

        res.json({
            success: true,
            count: officers.count,
            data: officersWithWorkload,
            pagination: {
                total: officers.count,
                limit: parseInt(limit),
                offset: parseInt(offset),
                pages: Math.ceil(officers.count / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Officers list error:', error);
        res.status(500).json({ error: 'Failed to fetch officers' });
    }
});

/**
 * POST /api/admin/assign/:id
 * Assign complaint to an officer
 */
router.post('/assign/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { officerId } = req.body;

        if (!officerId) {
            return res.status(400).json({ error: 'officerId is required' });
        }

        // Verify complaint exists
        const complaint = await Complaint.findByPk(id);
        if (!complaint) {
            return res.status(404).json({ error: 'Complaint not found' });
        }

        // Verify officer exists and is active
        const officer = await User.findOne({
            where: { id: officerId, role: 'officer', isActive: true }
        });
        if (!officer) {
            return res.status(404).json({ error: 'Officer not found or inactive' });
        }

        // Update complaint
        const previousOfficer = complaint.assignedTo;
        await complaint.update({
            assignedTo: officerId,
            assignedAt: new Date(),
            status: complaint.status === 'submitted' ? 'acknowledged' : complaint.status
        });

        // Create status history entry
        await StatusHistory.create({
            complaintId: id,
            previousStatus: complaint.status,
            newStatus: 'acknowledged',
            changedBy: req.user.id,
            notes: `Assigned to officer: ${officer.name}`
        });

        res.json({
            success: true,
            message: 'Complaint assigned successfully',
            data: {
                complaintId: id,
                officer: {
                    id: officer.id,
                    name: officer.name,
                    department: officer.department
                },
                previousOfficer,
                assignedAt: complaint.assignedAt
            }
        });

    } catch (error) {
        console.error('Assignment error:', error);
        res.status(500).json({ error: 'Failed to assign complaint' });
    }
});

/**
 * POST /api/admin/verify/:id
 * Update category of UNVERIFIED complaint and optionally assign
 */
router.post('/verify/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { category, officerId, notes } = req.body;

        if (!category) {
            return res.status(400).json({ error: 'category is required' });
        }

        // Validate category
        const validCategories = [
            'PUBLIC_WORKS', 'WATER_SUPPLY', 'SANITATION',
            'HEALTH', 'EDUCATION', 'ELECTRICITY', 'GENERAL'
        ];
        if (!validCategories.includes(category)) {
            return res.status(400).json({ error: 'Invalid category' });
        }

        // Verify complaint exists
        const complaint = await Complaint.findByPk(id);
        if (!complaint) {
            return res.status(404).json({ error: 'Complaint not found' });
        }

        const updateData = {
            category,
            needsReview: false,
            categoryConfidence: 1.0  // Admin verified = 100% confidence
        };

        // Optionally assign officer
        if (officerId) {
            const officer = await User.findOne({
                where: { id: officerId, role: 'officer', isActive: true }
            });
            if (!officer) {
                return res.status(404).json({ error: 'Officer not found or inactive' });
            }
            updateData.assignedTo = officerId;
            updateData.assignedAt = new Date();
            updateData.status = 'acknowledged';
        }

        await complaint.update(updateData);

        // Create status history entry
        await StatusHistory.create({
            complaintId: id,
            previousStatus: complaint.status,
            newStatus: updateData.status || complaint.status,
            changedBy: req.user.id,
            notes: notes || `Category verified: ${category}${officerId ? ' and assigned to officer' : ''}`
        });

        res.json({
            success: true,
            message: 'Complaint verified successfully',
            data: {
                complaintId: id,
                category,
                needsReview: false,
                assignedTo: updateData.assignedTo || null
            }
        });

    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ error: 'Failed to verify complaint' });
    }
});

/**
 * GET /api/admin/complaints
 * List all complaints with filters (admin view)
 */
router.get('/complaints', requireAdmin, async (req, res) => {
    try {
        const {
            limit = 20,
            offset = 0,
            status,
            category,
            priority,
            districtId,
            needsReview,
            assignedTo,
            sortBy = 'createdAt',
            sortOrder = 'DESC'
        } = req.query;

        const where = {};
        if (status) where.status = status;
        if (category) where.category = category;
        if (priority) where.priority = priority;
        if (districtId) where.districtId = districtId;
        if (needsReview !== undefined) where.needsReview = needsReview === 'true';
        if (assignedTo) where.assignedTo = assignedTo;

        const complaints = await Complaint.findAndCountAll({
            where,
            include: [
                {
                    model: District,
                    as: 'district',
                    attributes: ['id', 'name']
                },
                {
                    model: User,
                    as: 'officer',
                    attributes: ['id', 'name', 'department']
                }
            ],
            order: [[sortBy, sortOrder]],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            count: complaints.count,
            data: complaints.rows,
            pagination: {
                total: complaints.count,
                limit: parseInt(limit),
                offset: parseInt(offset),
                pages: Math.ceil(complaints.count / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Complaints list error:', error);
        res.status(500).json({ error: 'Failed to fetch complaints' });
    }
});

/**
 * GET /api/admin/complaint/:id
 * Get single complaint with full details
 */
router.get('/complaint/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const complaint = await Complaint.findByPk(id, {
            include: [
                {
                    model: District,
                    as: 'district',
                    attributes: ['id', 'name', 'latitude', 'longitude']
                },
                {
                    model: User,
                    as: 'officer',
                    attributes: ['id', 'name', 'email', 'phone', 'department']
                },
                {
                    model: StatusHistory,
                    as: 'statusHistory',
                    order: [['createdAt', 'DESC']]
                }
            ]
        });

        if (!complaint) {
            return res.status(404).json({ error: 'Complaint not found' });
        }

        // Get suggested officers for this complaint's category and district
        const suggestedOfficers = await User.findAll({
            where: {
                role: 'officer',
                isActive: true,
                [Op.or]: [
                    { department: complaint.category },
                    { districtId: complaint.districtId }
                ]
            },
            attributes: ['id', 'name', 'department', 'districtId'],
            include: [{
                model: District,
                as: 'district',
                attributes: ['name']
            }],
            limit: 10
        });

        // Get workload for suggested officers
        const officerIds = suggestedOfficers.map(o => o.id);
        const workloadCounts = await Complaint.findAll({
            attributes: [
                'assignedTo',
                [require('sequelize').fn('COUNT', 'id'), 'activeCount']
            ],
            where: {
                assignedTo: { [Op.in]: officerIds },
                status: { [Op.in]: ['acknowledged', 'in_progress'] }
            },
            group: ['assignedTo'],
            raw: true
        });

        const workloadMap = {};
        workloadCounts.forEach(w => {
            workloadMap[w.assignedTo] = parseInt(w.activeCount);
        });

        const officersWithWorkload = suggestedOfficers.map(officer => ({
            ...officer.toJSON(),
            currentWorkload: workloadMap[officer.id] || 0
        }));

        res.json({
            success: true,
            data: complaint,
            suggestedOfficers: officersWithWorkload
        });

    } catch (error) {
        console.error('Complaint detail error:', error);
        res.status(500).json({ error: 'Failed to fetch complaint' });
    }
});

module.exports = router;
