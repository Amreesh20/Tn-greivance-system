// frontend-admin/src/components/dashboard/StatusBadge.tsx
import React from 'react';

type Status = 'submitted' | 'acknowledged' | 'in_progress' | 'resolved' | 'rejected' | 'closed';
type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

interface StatusBadgeProps {
    status?: Status;
    priority?: Priority;
    category?: string;
}

const statusConfig: Record<Status, { label: string; className: string }> = {
    submitted: { label: 'Submitted', className: 'badge-submitted' },
    acknowledged: { label: 'Acknowledged', className: 'badge-acknowledged' },
    in_progress: { label: 'In Progress', className: 'badge-in-progress' },
    resolved: { label: 'Resolved', className: 'badge-resolved' },
    rejected: { label: 'Rejected', className: 'badge-rejected' },
    closed: { label: 'Closed', className: 'badge-closed' },
};

const priorityConfig: Record<Priority, { label: string; className: string }> = {
    CRITICAL: { label: 'Critical', className: 'badge-critical' },
    HIGH: { label: 'High', className: 'badge-high' },
    MEDIUM: { label: 'Medium', className: 'badge-medium' },
    LOW: { label: 'Low', className: 'badge-low' },
};

const categoryLabels: Record<string, string> = {
    PUBLIC_WORKS: 'Public Works',
    WATER_SUPPLY: 'Water Supply',
    SANITATION: 'Sanitation',
    HEALTH: 'Health',
    EDUCATION: 'Education',
    ELECTRICITY: 'Electricity',
    GENERAL: 'General',
    UNVERIFIED: 'Unverified',
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, priority, category }) => {
    if (status) {
        const config = statusConfig[status] || { label: status, className: 'badge-default' };
        return <span className={`status-badge ${config.className}`}>{config.label}</span>;
    }

    if (priority) {
        const config = priorityConfig[priority] || { label: priority, className: 'badge-default' };
        return <span className={`status-badge ${config.className}`}>{config.label}</span>;
    }

    if (category) {
        const label = categoryLabels[category] || category;
        const isUnverified = category === 'UNVERIFIED';
        return (
            <span className={`status-badge ${isUnverified ? 'badge-unverified' : 'badge-category'}`}>
                {label}
            </span>
        );
    }

    return null;
};

export default StatusBadge;
