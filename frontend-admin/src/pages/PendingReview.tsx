// frontend-admin/src/pages/PendingReview.tsx
import React, { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw, CheckCircle, UserPlus } from 'lucide-react';
import ComplaintsTable from '../components/dashboard/ComplaintsTable';
import StatusBadge from '../components/dashboard/StatusBadge';
import {
    getPendingComplaints,
    getOfficers,
    verifyComplaint,
    Complaint,
    Officer
} from '../services/adminService';

const categories = [
    { value: 'PUBLIC_WORKS', label: 'Public Works' },
    { value: 'WATER_SUPPLY', label: 'Water Supply' },
    { value: 'SANITATION', label: 'Sanitation' },
    { value: 'HEALTH', label: 'Health' },
    { value: 'EDUCATION', label: 'Education' },
    { value: 'ELECTRICITY', label: 'Electricity' },
    { value: 'GENERAL', label: 'General' },
];

const PendingReview: React.FC = () => {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [officers, setOfficers] = useState<Officer[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedOfficer, setSelectedOfficer] = useState<number | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [pendingData, officersData] = await Promise.all([
                getPendingComplaints({ limit: 50 }),
                getOfficers({ isActive: true }),
            ]);
            setComplaints(pendingData.data);
            setOfficers(officersData.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAssign = (complaint: Complaint) => {
        setSelectedComplaint(complaint);
        setSelectedCategory(complaint.category === 'UNVERIFIED' ? '' : complaint.category);
        setSelectedOfficer(null);
        setModalOpen(true);
    };

    const handleVerify = async () => {
        if (!selectedComplaint || !selectedCategory) return;

        setProcessing(true);
        try {
            await verifyComplaint(selectedComplaint.id, {
                category: selectedCategory,
                officerId: selectedOfficer || undefined,
            });
            setModalOpen(false);
            fetchData();
        } catch (error) {
            console.error('Failed to verify complaint:', error);
        } finally {
            setProcessing(false);
        }
    };

    const filteredOfficers = selectedCategory
        ? officers.filter(
            (o) => o.department === selectedCategory || !o.department
        )
        : officers;

    return (
        <div className="pending-page animate-fade-in">
            {/* Page Header */}
            <div className="page-header">
                <div className="header-content">
                    <h1>
                        <AlertTriangle className="header-icon warning" />
                        Pending Review Queue
                    </h1>
                    <p className="subtitle">
                        Complaints needing category verification or assignment
                    </p>
                </div>
                <button className="refresh-btn" onClick={fetchData}>
                    <RefreshCw size={18} />
                    Refresh
                </button>
            </div>

            {/* Count Badge */}
            <div className="queue-stats">
                <div className="stat-badge pending">
                    <span className="count">{complaints.length}</span>
                    <span className="label">Awaiting Review</span>
                </div>
            </div>

            {/* Table */}
            <div className="section-card">
                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Loading pending complaints...</p>
                    </div>
                ) : complaints.length === 0 ? (
                    <div className="empty-state">
                        <CheckCircle size={48} className="success-icon" />
                        <h3>All Caught Up!</h3>
                        <p>No complaints pending review.</p>
                    </div>
                ) : (
                    <ComplaintsTable
                        complaints={complaints}
                        onAssign={handleAssign}
                    />
                )}
            </div>

            {/* Verification Modal */}
            {modalOpen && selectedComplaint && (
                <div className="modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Verify & Assign</h2>
                            <StatusBadge category={selectedComplaint.category} />
                        </div>

                        <div className="modal-body">
                            <div className="complaint-preview">
                                <p className="complaint-text">{selectedComplaint.text}</p>
                                <div className="meta-row">
                                    <span>District: {selectedComplaint.district?.name}</span>
                                    <span>Phone: {selectedComplaint.citizenPhone}</span>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Select Category</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                >
                                    <option value="">-- Select Category --</option>
                                    {categories.map((cat) => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>
                                    <UserPlus size={16} /> Assign to Officer (Optional)
                                </label>
                                <select
                                    value={selectedOfficer || ''}
                                    onChange={(e) =>
                                        setSelectedOfficer(
                                            e.target.value ? parseInt(e.target.value) : null
                                        )
                                    }
                                >
                                    <option value="">-- Select Officer --</option>
                                    {filteredOfficers.map((officer) => (
                                        <option key={officer.id} value={officer.id}>
                                            {officer.name} ({officer.department}) - {officer.currentWorkload} active
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                className="btn-secondary"
                                onClick={() => setModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleVerify}
                                disabled={!selectedCategory || processing}
                            >
                                {processing ? 'Processing...' : 'Verify & Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PendingReview;
