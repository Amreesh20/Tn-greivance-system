// frontend-admin/src/components/dashboard/KPICard.tsx
import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
    title: string;
    value: string | number;
    change?: {
        value: number;
        type: 'increase' | 'decrease';
    };
    icon: LucideIcon;
    variant?: 'primary' | 'success' | 'warning' | 'critical' | 'default';
}

const variantStyles = {
    primary: 'kpi-primary',
    success: 'kpi-success',
    warning: 'kpi-warning',
    critical: 'kpi-critical',
    default: 'kpi-default',
};

const KPICard: React.FC<KPICardProps> = ({
    title,
    value,
    change,
    icon: Icon,
    variant = 'default',
}) => {
    return (
        <div className={`kpi-card ${variantStyles[variant]}`}>
            <div className="kpi-header">
                <span className="kpi-title">{title}</span>
                <div className="kpi-icon">
                    <Icon size={20} />
                </div>
            </div>
            <div className="kpi-value">{value}</div>
            {change && (
                <div className={`kpi-change ${change.type}`}>
                    {change.type === 'increase' ? (
                        <TrendingUp size={14} />
                    ) : (
                        <TrendingDown size={14} />
                    )}
                    <span>{change.value}%</span>
                </div>
            )}
        </div>
    );
};

export default KPICard;
