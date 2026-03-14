// frontend-admin/src/components/dashboard/ComplaintsTable.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Clock, MapPin } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { Complaint } from '../../services/adminService';

interface ComplaintsTableProps {
    complaints: Complaint[];
    limit?: number;
    showActions?: boolean;
    onAssign?: (complaint: Complaint) => void;
}

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

const getSLARemaining = (createdAt: string, slaHours: number = 24) => {
    const created = new Date(createdAt);
    const deadline = new Date(created.getTime() + slaHours * 60 * 60 * 1000);
    const now = new Date();
    const remaining = deadline.getTime() - now.getTime();

    if (remaining <= 0) return { text: 'Overdue', overdue: true };

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

    if (hours >= 24) {
        const days = Math.floor(hours / 24);
        return { text: `${days}d ${hours % 24}h`, overdue: false };
    }
    return { text: `${hours}h ${minutes}m`, overdue: hours < 4 };
};

const ComplaintsTable: React.FC<ComplaintsTableProps> = ({
    complaints,
    limit,
    showActions = true,
    onAssign,
}) => {
    const navigate = useNavigate();
    const displayComplaints = limit ? complaints.slice(0, limit) : complaints;

    return (
        <div className="complaints-table-wrapper">
            <table className="complaints-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>District</th>
                        <th>Category</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Officer</th>
                        <th>SLA</th>
                        <th>Date</th>
                        {showActions && <th>Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {displayComplaints.length === 0 ? (
                        <tr>
                            <td colSpan={showActions ? 9 : 8} className="no-data">
                                No complaints found
                            </td>
                        </tr>
                    ) : (
                        displayComplaints.map((complaint) => {
                            const sla = getSLARemaining(complaint.createdAt);
                            return (
                                <tr key={complaint.id} className="complaint-row">
                                    <td className="id-cell">GRV-{complaint.id}</td>
                                    <td>
                                        <div className="district-cell">
                                            <MapPin size={14} />
                                            {complaint.district?.name || complaint.districtId}
                                        </div>
                                    </td>
                                    <td>
                                        <StatusBadge category={complaint.category} />
                                    </td>
                                    <td>
                                        <StatusBadge priority={complaint.priority} />
                                    </td>
                                    <td>
                                        <StatusBadge status={complaint.status} />
                                    </td>
                                    <td>{complaint.officer?.name || '-'}</td>
                                    <td>
                                        <span className={`sla-cell ${sla.overdue ? 'overdue' : ''}`}>
                                            <Clock size={14} />
                                            {sla.text}
                                        </span>
                                    </td>
                                    <td>{formatDate(complaint.createdAt)}</td>
                                    {showActions && (
                                        <td className="actions-cell">
                                            <button
                                                className="action-btn view"
                                                onClick={() => navigate(`/complaint/${complaint.id}`)}
                                                title="View Details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            {onAssign && !complaint.assignedTo && (
                                                <button
                                                    className="action-btn assign"
                                                    onClick={() => onAssign(complaint)}
                                                    title="Assign Officer"
                                                >
                                                    Assign
                                                </button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ComplaintsTable;
