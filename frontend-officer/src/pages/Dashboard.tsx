import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList, AlertTriangle, Clock, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KPICard } from '@/components/shared/KPICard';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { SLATimer } from '@/components/shared/SLATimer';
import { statsApi, complaintsApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { Complaint } from '@/types';

export default function Dashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Fetch stats
    const { data: statsData, isLoading: statsLoading } = useQuery({
        queryKey: ['officer-stats'],
        queryFn: () => statsApi.getStats(),
        refetchInterval: 30000, // Refresh every 30s
    });

    // Fetch assigned complaints
    const { data: complaintsData, isLoading: complaintsLoading } = useQuery({
        queryKey: ['assigned-complaints', user?.id],
        queryFn: () => complaintsApi.getAssigned(user?.id || 0, {
            limit: 5,
            sortBy: 'createdAt',
            sortOrder: 'DESC'
        }),
        enabled: !!user?.id,
    });

    const stats = statsData?.stats || {
        total: 0,
        critical: 0,
        inProgress: 0,
        resolved: 0,
        pendingReview: 0,
    };

    const recentComplaints = complaintsData?.data || [];
    const criticalComplaints = recentComplaints.filter((c: Complaint) => c.priority === 'CRITICAL');

    if (statsLoading || complaintsLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="page-header">Dashboard Overview</h1>
                <p className="text-muted-foreground -mt-4">Welcome back! Here's your work summary for today.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Assigned Complaints"
                    value={complaintsData?.count || 0}
                    icon={ClipboardList}
                    variant="default"
                />
                <KPICard
                    title="Critical Complaints"
                    value={stats.critical}
                    icon={AlertTriangle}
                    variant="critical"
                />
                <KPICard
                    title="In Progress"
                    value={stats.inProgress}
                    icon={Clock}
                    variant="warning"
                />
                <KPICard
                    title="Resolved"
                    value={stats.resolved}
                    icon={AlertCircle}
                    variant="success"
                />
            </div>

            {/* Quick Actions */}
            <div className="flex gap-4">
                <Button onClick={() => navigate('/complaints')} className="action-button">
                    <ClipboardList className="w-5 h-5" />
                    View All Assigned Complaints
                </Button>
                <Button
                    onClick={() => navigate('/complaints?priority=CRITICAL')}
                    variant="outline"
                    className="action-button-outline border-critical text-critical hover:bg-critical/10"
                >
                    <AlertTriangle className="w-5 h-5" />
                    View Critical Complaints
                </Button>
            </div>

            {/* Recent Complaints */}
            <div className="bg-card border border-border rounded-lg">
                <div className="p-4 border-b border-border flex items-center justify-between">
                    <h2 className="section-header mb-0">Recent Assignments</h2>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/complaints')} className="text-primary">
                        View All <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
                <div className="divide-y divide-border">
                    {recentComplaints.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            No complaints assigned yet.
                        </div>
                    ) : (
                        recentComplaints.slice(0, 3).map((complaint: Complaint) => (
                            <div
                                key={complaint.id}
                                className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                                onClick={() => navigate(`/complaints/${complaint.id}`)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-medium text-foreground">#{complaint.id}</span>
                                            <PriorityBadge priority={complaint.priority} />
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-1">{complaint.category}</p>
                                        <p className="text-sm text-muted-foreground">{complaint.district?.name || 'Unknown District'}</p>
                                    </div>
                                    <SLATimer createdAt={complaint.createdAt} slaHours={complaint.slaHours} />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Critical Alerts */}
            {criticalComplaints.length > 0 && (
                <div className="bg-critical/5 border border-critical/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-5 h-5 text-critical" />
                        <h2 className="font-semibold text-critical">Critical Alerts</h2>
                    </div>
                    <div className="space-y-2">
                        {criticalComplaints.map((complaint: Complaint) => (
                            <div
                                key={complaint.id}
                                className="flex items-center justify-between p-3 bg-card rounded-lg border border-border cursor-pointer hover:border-critical/50 transition-colors"
                                onClick={() => navigate(`/complaints/${complaint.id}`)}
                            >
                                <div>
                                    <span className="font-medium text-foreground">#{complaint.id}</span>
                                    <span className="mx-2 text-muted-foreground">•</span>
                                    <span className="text-muted-foreground">{complaint.category}</span>
                                </div>
                                <SLATimer createdAt={complaint.createdAt} slaHours={complaint.slaHours} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
