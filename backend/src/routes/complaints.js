const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { Complaint, User, District } = require('../models');
const MLService = require('../services/mlService');
const router = express.Router();

// ============================================================================
// MULTER CONFIGURATION (File Uploads)
// ============================================================================

// Configure storage
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = 'uploads/';
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (error) {
            cb(error, null);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'audio') {
        // Accept audio files
        const allowedAudio = /mp3|wav|ogg|m4a|webm/;
        const extname = allowedAudio.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedAudio.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed (mp3, wav, ogg, m4a, webm)'));
        }
    } else if (file.fieldname === 'image') {
        // Accept image files
        const allowedImages = /jpeg|jpg|png|webp/;
        const extname = allowedImages.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedImages.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed (jpeg, jpg, png, webp)'));
        }
    } else {
        cb(new Error('Unexpected field'));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    }
});

// ============================================================================
// MIDDLEWARE (Authentication placeholder)
// ============================================================================

// TODO: Replace with actual JWT authentication middleware
const authenticateUser = async (req, res, next) => {
    try {
        // For now, use test user
        const user = await User.findOne({ where: { email: 'citizen@test.com' } });
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Authentication failed' });
    }
};

// ============================================================================
// ROUTES
// ============================================================================

/**
 * POST /api/complaints/submit
 * Submit a new complaint (text, voice, or image)
 */
router.post('/submit',
    authenticateUser,
    upload.fields([
        { name: 'audio', maxCount: 1 },
        { name: 'image', maxCount: 1 }
    ]),
    async (req, res) => {
        try {
            console.log('\n📥 ===== NEW COMPLAINT SUBMISSION =====');

            const {
                text,
                category,
                districtId,
                latitude,
                longitude,
                manualCategory,
                manualDistrict,
                citizenName,
                citizenPhone,
                citizenEmail
            } = req.body;

            const audioFile = req.files?.audio?.[0];
            const imageFile = req.files?.image?.[0];

            // Validate: Must have at least text, audio, or image
            if (!text && !audioFile && !imageFile) {
                return res.status(400).json({
                    error: 'Complaint must include text, audio recording, or image',
                });
            }

            // Run ML Pipeline
            console.log('🤖 Starting ML analysis...');
            const mlAnalysis = await MLService.analyzeComplaint({
                text: text,
                audioFile: audioFile,
                imageFile: imageFile,
                latitude: parseFloat(latitude) || null,
                longitude: parseFloat(longitude) || null
            });

            console.log('✅ ML Analysis complete:', {
                success: mlAnalysis.success,
                district: mlAnalysis.districtName,
                department: mlAnalysis.department,
                priority: mlAnalysis.priorityLevel
            });

            // For image-only complaints, use image description if no text
            let finalText = mlAnalysis.text || text || '';
            if (!finalText && imageFile && mlAnalysis.image?.description) {
                finalText = mlAnalysis.image.description;
            }
            if (!finalText) {
                finalText = 'Issue reported via image upload';
            }
            const finalCategory = manualCategory || mlAnalysis.image?.department || mlAnalysis.department || category || 'GENERAL';
            const finalDistrictId = manualDistrict || mlAnalysis.districtId || districtId;
            const finalPriority = mlAnalysis.priorityLevel || 'MEDIUM';
            const finalSlaHours = mlAnalysis.slaHours || 24;

            // Validate text length (skip for image-only if we have image description)
            if (finalText.length < 10 && !imageFile) {
                return res.status(400).json({
                    error: 'Complaint text must be at least 10 characters',
                });
            }

            // Validate district
            if (!finalDistrictId) {
                return res.status(400).json({
                    error: 'District could not be determined. Please provide location manually.',
                });
            }

            // Verify district exists
            const districtExists = await District.findOne({
                where: { id: finalDistrictId }
            });

            if (!districtExists) {
                console.error(`❌ District not found: ${finalDistrictId}`);
                return res.status(400).json({
                    error: 'Invalid district ID',
                });
            }

            // Create complaint in database
            const complaint = await Complaint.create({
                citizenName: citizenName || req.user?.name || 'Anonymous',
                citizenPhone: citizenPhone || req.user?.phone || '0000000000',
                citizenEmail: citizenEmail || req.user?.email || null,
                text: finalText,
                category: finalCategory,
                districtId: finalDistrictId,
                latitude: parseFloat(latitude) || mlAnalysis.location?.latitude || null,
                longitude: parseFloat(longitude) || mlAnalysis.location?.longitude || null,
                priority: finalPriority,
                priorityScore: mlAnalysis.priorityScore || null,
                slaHours: finalSlaHours,
                status: 'submitted',
                fraudScore: 0,

                // ML metadata
                mlClassificationConfidence: mlAnalysis.classification?.confidence || null,
                mlLocationConfidence: mlAnalysis.location?.confidence || null,
                mlUsed: mlAnalysis.mlUsed,
                mlResults: mlAnalysis, // Store full ML analysis

                // New ML fields for admin review
                categoryConfidence: mlAnalysis.classification?.confidence || null,
                suggestedDistrict: mlAnalysis.location?.districtId || null,
                suggestedDistrictName: mlAnalysis.location?.districtName || null,
                needsReview: mlAnalysis.classification?.needsReview || finalCategory === 'UNVERIFIED',

                // File paths
                audioPath: audioFile?.path || null,
                imagePath: imageFile?.path || null,

                // Voice analysis
                voiceTranscript: mlAnalysis.voice?.text || null,
                voiceSentiment: mlAnalysis.voice?.sentiment || null,
                voiceUrgency: mlAnalysis.voice?.urgency || null,

                // Image analysis
                imageSeverity: mlAnalysis.image?.severity || null,
                imageIssues: mlAnalysis.image?.issues || null,
            });

            console.log(`✅ Complaint created: ID ${complaint.id}`);
            console.log('===== SUBMISSION COMPLETE =====\n');

            // Respond with success
            res.status(201).json({
                success: true,
                complaintId: complaint.id,
                message: 'Complaint submitted successfully',
                data: {
                    id: complaint.id,
                    text: complaint.text,
                    category: complaint.category,
                    districtId: complaint.districtId,
                    districtName: districtExists.name || mlAnalysis.districtName,
                    priority: complaint.priority,
                    priorityScore: complaint.priorityScore,
                    slaHours: complaint.slaHours,
                    status: complaint.status,
                    createdAt: complaint.createdAt,

                    // ML insights
                    mlAnalysis: {
                        usedML: mlAnalysis.mlUsed,
                        locationConfidence: mlAnalysis.location?.confidence,
                        classificationConfidence: mlAnalysis.classification?.confidence,
                        detectedDistrict: mlAnalysis.districtName,
                        detectedDepartment: mlAnalysis.department,
                        priorityComponents: mlAnalysis.priority?.components,
                        // Image analysis data
                        imageAnalysis: mlAnalysis.image ? {
                            description: mlAnalysis.image.description,
                            primaryIssue: mlAnalysis.image.primaryIssue,
                            severity: mlAnalysis.image.severityText,
                            confidence: mlAnalysis.image.confidence,
                            detectedDepartment: mlAnalysis.image.department
                        } : null
                    }
                },
            });

        } catch (error) {
            console.error('❌ Complaint submission error:', error);

            // Clean up uploaded files on error
            if (req.files) {
                const files = Object.values(req.files).flat();
                for (const file of files) {
                    try {
                        await fs.unlink(file.path);
                    } catch (unlinkError) {
                        console.error('Failed to delete file:', unlinkError);
                    }
                }
            }

            res.status(500).json({
                error: 'Failed to submit complaint',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    }
);

/**
 * GET /api/complaints
 * List complaints with filters and pagination
 */
router.get('/', authenticateUser, async (req, res) => {
    try {
        const {
            limit = 20,
            offset = 0,
            status,
            districtId,
            category,
            priority,
            userId,
            sortBy = 'createdAt',
            sortOrder = 'DESC'
        } = req.query;

        // Build where clause
        const where = {};
        if (status) where.status = status;
        if (districtId) where.districtId = districtId;
        if (category) where.category = category;
        if (priority) where.priority = priority;
        if (userId) where.userId = userId;

        // If user is citizen, only show their complaints
        if (req.user.role === 'citizen') {
            where.userId = req.user.id;
        }

        // Query complaints
        const complaints = await Complaint.findAndCountAll({
            where,
            include: [
                {
                    model: User,
                    attributes: ['id', 'name', 'phone', 'role'],
                },
                {
                    model: District,
                    attributes: ['id', 'name'],
                }
            ],
            order: [[sortBy, sortOrder]],
            limit: parseInt(limit),
            offset: parseInt(offset),
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
        console.error('❌ List complaints error:', error);
        res.status(500).json({
            error: 'Failed to fetch complaints',
        });
    }
});

/**
 * GET /api/complaints/stats/summary
 * Get complaint statistics
 */
router.get('/stats/summary', authenticateUser, async (req, res) => {
    try {
        const { districtId, category, startDate, endDate } = req.query;
        const { Op } = require('sequelize');

        const where = {};
        if (districtId) where.districtId = districtId;
        if (category) where.category = category;
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt[Op.gte] = new Date(startDate);
            if (endDate) where.createdAt[Op.lte] = new Date(endDate);
        }

        // Total counts by status
        const totalCount = await Complaint.count({ where });
        const submittedCount = await Complaint.count({ where: { ...where, status: 'submitted' } });
        const inProgressCount = await Complaint.count({ where: { ...where, status: 'in_progress' } });
        const resolvedCount = await Complaint.count({ where: { ...where, status: 'resolved' } });

        // Priority breakdown
        const criticalCount = await Complaint.count({ where: { ...where, priority: 'CRITICAL' } });
        const highCount = await Complaint.count({ where: { ...where, priority: 'HIGH' } });
        const mediumCount = await Complaint.count({ where: { ...where, priority: 'MEDIUM' } });
        const lowCount = await Complaint.count({ where: { ...where, priority: 'LOW' } });

        res.json({
            success: true,
            data: {
                total: totalCount,
                byStatus: {
                    submitted: submittedCount,
                    inProgress: inProgressCount,
                    resolved: resolvedCount,
                },
                byPriority: {
                    critical: criticalCount,
                    high: highCount,
                    medium: mediumCount,
                    low: lowCount,
                },
                resolutionRate: totalCount > 0 ? (resolvedCount / totalCount * 100).toFixed(2) : 0,
            }
        });

    } catch (error) {
        console.error('❌ Stats error:', error);
        res.status(500).json({
            error: 'Failed to fetch statistics',
        });
    }
});

/**
 * GET /api/complaints/ml/status
 * Check ML service health
 */
router.get('/ml/status', async (req, res) => {
    try {
        const health = await MLService.healthCheck();
        res.json(health);
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            error: error.message
        });
    }
});

/**
 * GET /api/complaints/track/:phone
 * Track complaints by phone number (no auth required)
 */
router.get('/track/:phone', async (req, res) => {
    try {
        const { phone } = req.params;

        // Validate phone number format
        if (!phone || phone.length < 10) {
            return res.status(400).json({
                success: false,
                error: 'Invalid phone number',
            });
        }

        // Find all complaints for this phone number
        const complaints = await Complaint.findAll({
            where: { citizenPhone: phone },
            include: [
                {
                    model: District,
                    as: 'district',
                    attributes: ['id', 'name'],
                }
            ],
            order: [['createdAt', 'DESC']],
            attributes: [
                'id', 'text', 'category', 'status', 'priority',
                'createdAt', 'updatedAt', 'resolution', 'resolvedAt'
            ]
        });

        if (complaints.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No complaints found for this phone number',
            });
        }

        res.json({
            success: true,
            count: complaints.length,
            data: complaints,
        });

    } catch (error) {
        console.error('❌ Track complaint error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to track complaints',
        });
    }
});

/**
 * GET /api/complaints/:id
 * Get single complaint by ID
 */
router.get('/:id', authenticateUser, async (req, res) => {
    try {
        const complaint = await Complaint.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    attributes: ['id', 'name', 'phone', 'email', 'role'],
                },
                {
                    model: District,
                    attributes: ['id', 'name'],
                }
            ],
        });

        if (!complaint) {
            return res.status(404).json({
                error: 'Complaint not found',
            });
        }

        // Authorization: Citizens can only view their own complaints
        if (req.user.role === 'citizen' && complaint.userId !== req.user.id) {
            return res.status(403).json({
                error: 'Access denied',
            });
        }

        res.json({
            success: true,
            data: complaint,
        });

    } catch (error) {
        console.error('❌ Get complaint error:', error);
        res.status(500).json({
            error: 'Failed to fetch complaint',
        });
    }
});

/**
 * PATCH /api/complaints/:id/status
 * Update complaint status (officers only)
 */
router.patch('/:id/status', authenticateUser, async (req, res) => {
    try {
        const { status, resolution } = req.body;

        // Validate status
        const validStatuses = ['submitted', 'acknowledged', 'in_progress', 'resolved', 'rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                error: 'Invalid status. Must be one of: ' + validStatuses.join(', '),
            });
        }

        const complaint = await Complaint.findByPk(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                error: 'Complaint not found',
            });
        }

        // TODO: Check if user is officer for this district/category
        // if (req.user.role !== 'officer') {
        //     return res.status(403).json({ error: 'Only officers can update status' });
        // }

        // Update complaint
        complaint.status = status;
        if (resolution) complaint.resolution = resolution;
        if (status === 'resolved') complaint.resolvedAt = new Date();

        await complaint.save();

        console.log(`✅ Complaint ${complaint.id} status updated to ${status}`);

        res.json({
            success: true,
            message: 'Status updated successfully',
            data: complaint,
        });

    } catch (error) {
        console.error('❌ Update status error:', error);
        res.status(500).json({
            error: 'Failed to update status',
        });
    }
});

module.exports = router;
