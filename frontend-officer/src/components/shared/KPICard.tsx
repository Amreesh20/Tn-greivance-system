import { LucideIcon } from 'lucide-react';

interface KPICardProps {
    title: string;
    value: number;
    icon: LucideIcon;
    variant?: 'default' | 'critical' | 'warning' | 'success';
}

export function KPICard({ title, value, icon: Icon, variant = 'default' }: KPICardProps) {
    const variantStyles = {
        default: 'text-primary bg-primary/10',
        critical: 'text-critical bg-critical/10',
        warning: 'text-warning bg-warning/10',
        success: 'text-success bg-success/10',
    };

    return (
        <div className="kpi-card">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-muted-foreground mb-1">{title}</p>
                    <p className="text-3xl font-bold text-foreground">{value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${variantStyles[variant]}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
}
