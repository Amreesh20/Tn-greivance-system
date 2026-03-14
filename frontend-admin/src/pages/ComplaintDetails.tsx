// frontend-admin/src/pages/ComplaintDetails.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    MapPin,
    User,
    Calendar,
    Clock,
    Phone,
    Mail,
    UserPlus,
    CheckCircle,
    AlertTriangle,
    FileText,
    Mic,
    Image,
    TrendingUp,
    Building2,
    Shield,
    Timer,
    Zap,
} from 'lucide-react';
import StatusBadge from '../components/dashboard/StatusBadge';
import {
    getComplaint,
    assignOfficer,
    Complaint,
    Officer
} from '../services/adminService';

const ComplaintDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [complaint, setComplaint] = useState<Complaint | null>(null);
    const [suggestedOfficers, setSuggestedOfficers] = useState<Officer[]>([]);
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(false);
    const [selectedOfficer, setSelectedOfficer] = useState<number | null>(null);

    useEffect(() => {
        const fetchComplaint = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const data = await getComplaint(parseInt(id));
                setComplaint(data.data);
                setSuggestedOfficers(data.suggestedOfficers);
            } catch (error) {
                console.error('Failed to fetch complaint:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchComplaint();
    }, [id]);

    const handleAssign = async () => {
        if (!complaint || !selectedOfficer) return;

        setAssigning(true);
        try {
            await assignOfficer(complaint.id, selectedOfficer);
            const data = await getComplaint(complaint.id);
            setComplaint(data.data);
            setSelectedOfficer(null);
        } catch (error) {
            console.error('Failed to assign officer:', error);
        } finally {
            setAssigning(false);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority?.toUpperCase()) {
            case 'CRITICAL': return '#ef4444';
            case 'HIGH': return '#f97316';
            case 'MEDIUM': return '#eab308';
            case 'LOW': return '#22c55e';
            default: return '#64748b';
        }
    };

    if (loading) {
        return (
            <div className="details-loading">
                <div className="loading-pulse">
                    <div className="pulse-ring"></div>
                    <FileText size={32} />
                </div>
                <p>Loading complaint details...</p>
            </div>
        );
    }

    if (!complaint) {
        return (
            <div className="details-error">
                <AlertTriangle size={56} />
                <h2>Complaint Not Found</h2>
                <p>The complaint you're looking for doesn't exist or has been removed.</p>
                <button className="btn-primary" onClick={() => navigate('/complaints')}>
                    ← Back to Complaints
                </button>
            </div>
        );
    }

    return (
        <div className="complaint-details-v2">
            {/* Floating Back Button */}
            <button className="floating-back-btn" onClick={() => navigate(-1)}>
                <ArrowLeft size={18} />
                <span>Back</span>
            </button>

            {/* Hero Header */}
            <div className="details-hero">
                <div className="hero-content">
                    <div className="complaint-id-badge">
                        <FileText size={20} />
                        <span>GRV-{complaint.id}</span>
                    </div>
                    <h1 className="hero-title">Complaint Details</h1>
                    <div className="hero-badges">
                        <StatusBadge status={complaint.status} />
                        <StatusBadge priority={complaint.priority} />
                        <StatusBadge category={complaint.category} />
                    </div>
                </div>
                <div className="hero-meta">
                    <div className="meta-item">
                        <Calendar size={16} />
                        <span>{new Date(complaint.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                        })}</span>
                    </div>
                    <div className="meta-item">
                        <Clock size={16} />
                        <span>{new Date(complaint.createdAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}</span>
                    </div>
                </div>
            </div>

            {/* Priority Progress Bar */}
            <div className="priority-indicator">
                <div className="priority-bar" style={{
                    background: `linear-gradient(90deg, ${getPriorityColor(complaint.priority)} 0%, ${getPriorityColor(complaint.priority)}40 100%)`
                }}>
                    <div className="priority-info">
                        <Zap size={18} />
                        <span>{complaint.priority} Priority</span>
                    </div>
                    <div className="sla-info">
                        <Timer size={16} />
                        <span>SLA: {complaint.slaHours || 24} hours</span>
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="details-content-grid">
                {/* Left Column - Main Content */}
                <div className="main-column">
                    {/* Complaint Text Card */}
                    <div className="content-card complaint-card">
                        <div className="card-header">
                            <div className="header-icon">
                                <FileText size={20} />
                            </div>
                            <h3>Complaint Description</h3>
                        </div>
                        <div className="card-body">
                            <p className="complaint-text-v2">{complaint.text}</p>
                        </div>
                        {(complaint.audioPath || complaint.imagePath) && (
                            <div className="attachment-indicators">
                                {complaint.audioPath && (
                                    <div className="attachment-badge voice">
                                        <Mic size={14} />
                                        <span>Voice Recording</span>
                                    </div>
                                )}
                                {complaint.imagePath && (
                                    <div className="attachment-badge image">
                                        <Image size={14} />
                                        <span>Image Attached</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ML Review Warning */}
                    {complaint.needsReview && (
                        <div className="content-card review-card">
                            <div className="card-header warning">
                                <div className="header-icon warning">
                                    <AlertTriangle size={20} />
                                </div>
                                <h3>Manual Review Required</h3>
                            </div>
                            <div className="card-body">
                                <div className="review-info">
                                    <div className="confidence-meter">
                                        <span className="confidence-label">Classification Confidence</span>
                                        <div className="meter-track">
                                            <div
                                                className="meter-fill warning"
                                                style={{ width: `${(complaint.categoryConfidence || 0) * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className="confidence-value">
                                            {((complaint.categoryConfidence || 0) * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                    {complaint.suggestedDistrictName && (
                                        <div className="suggestion-box">
                                            <MapPin size={16} />
                                            <span>Suggested District: <strong>{complaint.suggestedDistrictName}</strong></span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Officer Assignment Card */}
                    <div className="content-card assignment-card">
                        <div className="card-header">
                            <div className="header-icon">
                                <UserPlus size={20} />
                            </div>
                            <h3>Officer Assignment</h3>
                        </div>
                        <div className="card-body">
                            {complaint.officer ? (
                                <div className="assigned-officer-v2">
                                    <div className="officer-avatar">
                                        {complaint.officer.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className="officer-details">
                                        <div className="officer-name-row">
                                            <CheckCircle size={16} className="success-icon" />
                                            <strong>{complaint.officer.name}</strong>
                                        </div>
                                        <span className="officer-department">
                                            <Building2 size={14} />
                                            {complaint.officer.department}
                                        </span>
                                    </div>
                                    <div className="assigned-badge">
                                        <Shield size={14} />
                                        Assigned
                                    </div>
                                </div>
                            ) : (
                                <div className="assignment-form-v2">
                                    <div className="form-group">
                                        <label>Select Officer to Assign</label>
                                        <select
                                            value={selectedOfficer || ''}
                                            onChange={(e) =>
                                                setSelectedOfficer(
                                                    e.target.value ? parseInt(e.target.value) : null
                                                )
                                            }
                                            className="officer-select"
                                        >
                                            <option value="">Choose an officer...</option>
                                            {suggestedOfficers.map((officer) => (
                                                <option key={officer.id} value={officer.id}>
                                                    {officer.name} • {officer.department} • {officer.currentWorkload} active cases
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <button
                                        className="assign-btn"
                                        disabled={!selectedOfficer || assigning}
                                        onClick={handleAssign}
                                    >
                                        {assigning ? (
                                            <>
                                                <div className="btn-spinner"></div>
                                                Assigning...
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus size={18} />
                                                Assign Officer
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Sidebar */}
                <div className="sidebar-column">
                    {/* Citizen Info Card */}
                    <div className="content-card info-card">
                        <div className="card-header compact">
                            <User size={18} />
                            <h3>Citizen Information</h3>
                        </div>
                        <div className="card-body">
                            <div className="info-grid">
                                <div className="info-row">
                                    <div className="info-icon">
                                        <User size={16} />
                                    </div>
                                    <div className="info-content">
                                        <span className="info-label">Name</span>
                                        <span className="info-value">{complaint.citizenName}</span>
                                    </div>
                                </div>
                                <div className="info-row">
                                    <div className="info-icon">
                                        <Phone size={16} />
                                    </div>
                                    <div className="info-content">
                                        <span className="info-label">Phone</span>
                                        <span className="info-value">{complaint.citizenPhone}</span>
                                    </div>
                                </div>
                                {complaint.citizenEmail && (
                                    <div className="info-row">
                                        <div className="info-icon">
                                            <Mail size={16} />
                                        </div>
                                        <div className="info-content">
                                            <span className="info-label">Email</span>
                                            <span className="info-value email">{complaint.citizenEmail}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Location Card */}
                    <div className="content-card info-card">
                        <div className="card-header compact">
                            <MapPin size={18} />
                            <h3>Location</h3>
                        </div>
                        <div className="card-body">
                            <div className="location-display">
                                <div className="location-icon-wrapper">
                                    <MapPin size={24} />
                                </div>
                                <div className="location-details">
                                    <span className="location-name">
                                        {complaint.district?.name || complaint.districtId || 'Not specified'}
                                    </span>
                                    <span className="location-type">District</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ML Analysis Card */}
                    <div className="content-card info-card">
                        <div className="card-header compact">
                            <TrendingUp size={18} />
                            <h3>AI Analysis</h3>
                        </div>
                        <div className="card-body">
                            <div className="analysis-items">
                                <div className="analysis-item">
                                    <span className="analysis-label">Category</span>
                                    <span className="analysis-value">{complaint.category}</span>
                                </div>
                                <div className="analysis-item">
                                    <span className="analysis-label">Priority Score</span>
                                    <span className="analysis-value">
                                        {complaint.priorityScore?.toFixed(1) || 'N/A'}
                                    </span>
                                </div>
                                <div className="analysis-item">
                                    <span className="analysis-label">ML Used</span>
                                    <span className="analysis-value">
                                        {complaint.mlUsed ? '✓ Yes' : '✗ No'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .complaint-details-v2 {
                    max-width: 1400px;
                    margin: 0 auto;
                    animation: fadeIn 0.4s ease;
                }

                .floating-back-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    background: rgba(99, 102, 241, 0.1);
                    border: 1px solid rgba(99, 102, 241, 0.3);
                    border-radius: 2rem;
                    color: #a5b4fc;
                    cursor: pointer;
                    font-size: 0.875rem;
                    margin-bottom: 1.5rem;
                    transition: all 0.2s ease;
                }

                .floating-back-btn:hover {
                    background: rgba(99, 102, 241, 0.2);
                    transform: translateX(-4px);
                }

                /* Hero Section */
                .details-hero {
                    background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%);
                    border: 1px solid rgba(99, 102, 241, 0.2);
                    border-radius: 1rem;
                    padding: 2rem;
                    margin-bottom: 1.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }

                .complaint-id-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    background: rgba(99, 102, 241, 0.2);
                    border-radius: 0.5rem;
                    color: #a5b4fc;
                    font-weight: 600;
                    font-size: 0.875rem;
                    margin-bottom: 0.75rem;
                }

                .hero-title {
                    font-size: 1.75rem;
                    font-weight: 700;
                    margin-bottom: 1rem;
                    background: linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .hero-badges {
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }

                .hero-meta {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    align-items: flex-end;
                }

                .meta-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: #94a3b8;
                    font-size: 0.875rem;
                }

                /* Priority Indicator */
                .priority-indicator {
                    margin-bottom: 1.5rem;
                }

                .priority-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 1.5rem;
                    border-radius: 0.75rem;
                }

                .priority-info, .sla-info {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    font-size: 0.875rem;
                    letter-spacing: 0.05em;
                }

                /* Content Grid */
                .details-content-grid {
                    display: grid;
                    grid-template-columns: 1fr 380px;
                    gap: 1.5rem;
                }

                /* Content Cards */
                .content-card {
                    background: #1e293b;
                    border: 1px solid #334155;
                    border-radius: 1rem;
                    overflow: hidden;
                    margin-bottom: 1.25rem;
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }

                .content-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
                }

                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 1.25rem 1.5rem;
                    background: rgba(255, 255, 255, 0.02);
                    border-bottom: 1px solid #334155;
                }

                .card-header.compact {
                    padding: 1rem 1.25rem;
                }

                .card-header.warning {
                    background: rgba(245, 158, 11, 0.1);
                    border-bottom-color: rgba(245, 158, 11, 0.3);
                }

                .header-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 0.75rem;
                    background: rgba(99, 102, 241, 0.15);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #a5b4fc;
                }

                .header-icon.warning {
                    background: rgba(245, 158, 11, 0.15);
                    color: #fbbf24;
                }

                .card-header h3 {
                    font-size: 1rem;
                    font-weight: 600;
                    color: #f1f5f9;
                }

                .card-body {
                    padding: 1.5rem;
                }

                /* Complaint Text */
                .complaint-text-v2 {
                    font-size: 1.1rem;
                    line-height: 1.8;
                    color: #e2e8f0;
                }

                .attachment-indicators {
                    display: flex;
                    gap: 0.75rem;
                    padding: 1rem 1.5rem;
                    border-top: 1px solid #334155;
                    background: rgba(0, 0, 0, 0.2);
                }

                .attachment-badge {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 0.75rem;
                    border-radius: 0.5rem;
                    font-size: 0.75rem;
                    font-weight: 500;
                }

                .attachment-badge.voice {
                    background: rgba(16, 185, 129, 0.15);
                    color: #34d399;
                }

                .attachment-badge.image {
                    background: rgba(59, 130, 246, 0.15);
                    color: #60a5fa;
                }

                /* Review Card */
                .review-card {
                    border-color: rgba(245, 158, 11, 0.3);
                }

                .confidence-meter {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1rem;
                }

                .confidence-label {
                    font-size: 0.875rem;
                    color: #94a3b8;
                    min-width: 180px;
                }

                .meter-track {
                    flex: 1;
                    height: 8px;
                    background: #334155;
                    border-radius: 4px;
                    overflow: hidden;
                }

                .meter-fill {
                    height: 100%;
                    border-radius: 4px;
                    transition: width 0.5s ease;
                }

                .meter-fill.warning {
                    background: linear-gradient(90deg, #f59e0b, #fbbf24);
                }

                .confidence-value {
                    font-weight: 600;
                    min-width: 50px;
                    text-align: right;
                    color: #fbbf24;
                }

                .suggestion-box {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem 1rem;
                    background: rgba(245, 158, 11, 0.1);
                    border-radius: 0.5rem;
                    color: #fbbf24;
                    font-size: 0.875rem;
                }

                /* Assignment */
                .assigned-officer-v2 {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                    background: rgba(16, 185, 129, 0.1);
                    border: 1px solid rgba(16, 185, 129, 0.2);
                    border-radius: 0.75rem;
                }

                .officer-avatar {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #6366f1, #a855f7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    font-size: 1rem;
                    color: white;
                }

                .officer-details {
                    flex: 1;
                }

                .officer-name-row {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.25rem;
                }

                .success-icon {
                    color: #34d399;
                }

                .officer-department {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.875rem;
                    color: #94a3b8;
                }

                .assigned-badge {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    background: rgba(16, 185, 129, 0.2);
                    border-radius: 2rem;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: #34d399;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .assignment-form-v2 {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .assignment-form-v2 .form-group {
                    margin-bottom: 0;
                }

                .assignment-form-v2 label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-size: 0.875rem;
                    color: #94a3b8;
                }

                .officer-select {
                    width: 100%;
                    padding: 0.875rem 1rem;
                    background: #0f172a;
                    border: 1px solid #334155;
                    border-radius: 0.5rem;
                    color: #f1f5f9;
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: border-color 0.2s ease;
                }

                .officer-select:focus {
                    outline: none;
                    border-color: #6366f1;
                }

                .assign-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    padding: 0.875rem 1.5rem;
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    border: none;
                    border-radius: 0.5rem;
                    color: white;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .assign-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
                }

                .assign-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .btn-spinner {
                    width: 18px;
                    height: 18px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                /* Sidebar Info Cards */
                .info-card .card-header {
                    gap: 0.5rem;
                }

                .info-card .card-header svg {
                    color: #6366f1;
                }

                .info-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .info-row {
                    display: flex;
                    align-items: flex-start;
                    gap: 1rem;
                }

                .info-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 0.5rem;
                    background: rgba(99, 102, 241, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #6366f1;
                    flex-shrink: 0;
                }

                .info-content {
                    display: flex;
                    flex-direction: column;
                    gap: 0.125rem;
                }

                .info-label {
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #64748b;
                }

                .info-value {
                    font-weight: 500;
                    color: #f1f5f9;
                }

                .info-value.email {
                    font-size: 0.875rem;
                    word-break: break-all;
                }

                /* Location Display */
                .location-display {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                    background: rgba(99, 102, 241, 0.1);
                    border-radius: 0.75rem;
                }

                .location-icon-wrapper {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }

                .location-details {
                    display: flex;
                    flex-direction: column;
                }

                .location-name {
                    font-weight: 600;
                    font-size: 1.1rem;
                    color: #f1f5f9;
                }

                .location-type {
                    font-size: 0.75rem;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                /* Analysis Items */
                .analysis-items {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .analysis-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 0.75rem 1rem;
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: 0.5rem;
                }

                .analysis-label {
                    color: #94a3b8;
                    font-size: 0.875rem;
                }

                .analysis-value {
                    font-weight: 600;
                    color: #f1f5f9;
                }

                /* Loading & Error States */
                .details-loading, .details-error {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 400px;
                    text-align: center;
                    color: #94a3b8;
                }

                .loading-pulse {
                    position: relative;
                    width: 80px;
                    height: 80px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 1.5rem;
                    color: #6366f1;
                }

                .pulse-ring {
                    position: absolute;
                    inset: 0;
                    border: 3px solid #6366f1;
                    border-radius: 50%;
                    animation: pulse 1.5s ease-out infinite;
                }

                .details-error svg {
                    color: #f59e0b;
                    margin-bottom: 1rem;
                }

                .details-error h2 {
                    font-size: 1.5rem;
                    margin-bottom: 0.5rem;
                    color: #f1f5f9;
                }

                .details-error p {
                    margin-bottom: 1.5rem;
                }

                @keyframes pulse {
                    0% {
                        transform: scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(1.5);
                        opacity: 0;
                    }
                }

                @keyframes spin {
                    to {
                        transform: rotate(360deg);
                    }
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                /* Responsive */
                @media (max-width: 1024px) {
                    .details-content-grid {
                        grid-template-columns: 1fr;
                    }

                    .sidebar-column {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                        gap: 1.25rem;
                    }

                    .sidebar-column .content-card {
                        margin-bottom: 0;
                    }
                }

                @media (max-width: 640px) {
                    .details-hero {
                        flex-direction: column;
                        gap: 1.5rem;
                    }

                    .hero-meta {
                        align-items: flex-start;
                        flex-direction: row;
                        gap: 1rem;
                    }

                    .priority-bar {
                        flex-direction: column;
                        gap: 0.5rem;
                        align-items: flex-start;
                    }
                }
            `}</style>
        </div>
    );
};

export default ComplaintDetails;
