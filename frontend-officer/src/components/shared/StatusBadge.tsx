import type { Status } from '@/types';

interface StatusBadgeProps {
    status: Status;
}

const statusConfig: Record<Status, { label: string; className: string }> = {
    submitted: { label: 'Submitted', className: 'status-badge status-submitted' },
    acknowledged: { label: 'Acknowledged', className: 'status-badge status-acknowledged' },
    in_progress: { label: 'In Progress', className: 'status-badge status-in_progress' },
    resolved: { label: 'Resolved', className: 'status-badge status-resolved' },
    rejected: { label: 'Rejected', className: 'status-badge bg-red-100 text-red-800' },
    closed: { label: 'Closed', className: 'status-badge status-closed' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
    const config = statusConfig[status] || statusConfig.submitted;
    return <span className={config.className}>{config.label}</span>;
}
