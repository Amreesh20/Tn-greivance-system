import type { Priority } from '@/types';

interface PriorityBadgeProps {
    priority: Priority;
}

const priorityConfig = {
    CRITICAL: { label: 'Critical', className: 'priority-badge priority-critical' },
    HIGH: { label: 'High', className: 'priority-badge priority-high' },
    MEDIUM: { label: 'Medium', className: 'priority-badge priority-medium' },
    LOW: { label: 'Low', className: 'priority-badge priority-low' },
};

export function PriorityBadge({ priority }: PriorityBadgeProps) {
    const config = priorityConfig[priority] || priorityConfig.MEDIUM;
    return <span className={config.className}>{config.label}</span>;
}
