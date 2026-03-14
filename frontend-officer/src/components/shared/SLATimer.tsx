import { useMemo } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface SLATimerProps {
    createdAt: string;
    slaHours: number;
}

export function SLATimer({ createdAt, slaHours }: SLATimerProps) {
    const { remaining, isOverdue, display } = useMemo(() => {
        const created = new Date(createdAt);
        const deadline = new Date(created.getTime() + slaHours * 60 * 60 * 1000);
        const now = new Date();
        const diffMs = deadline.getTime() - now.getTime();
        const isOverdue = diffMs < 0;

        const absDiff = Math.abs(diffMs);
        const hours = Math.floor(absDiff / (1000 * 60 * 60));
        const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));

        let display = '';
        if (hours > 24) {
            const days = Math.floor(hours / 24);
            display = `${days}d ${hours % 24}h`;
        } else {
            display = `${hours}h ${minutes}m`;
        }

        return {
            remaining: diffMs,
            isOverdue,
            display: isOverdue ? `-${display}` : display,
        };
    }, [createdAt, slaHours]);

    const isWarning = remaining < 4 * 60 * 60 * 1000 && !isOverdue; // Less than 4 hours

    return (
        <div
            className={`flex items-center gap-1.5 text-sm font-medium px-2 py-1 rounded ${isOverdue
                    ? 'text-critical bg-critical/10'
                    : isWarning
                        ? 'text-warning bg-warning/10'
                        : 'text-muted-foreground bg-muted'
                }`}
        >
            {isOverdue ? (
                <AlertTriangle className="w-4 h-4" />
            ) : (
                <Clock className="w-4 h-4" />
            )}
            <span>{display}</span>
        </div>
    );
}
