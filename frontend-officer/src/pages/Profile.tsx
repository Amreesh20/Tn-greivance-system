import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { User, Mail, Phone, Building2, MapPin, Loader2 } from 'lucide-react';
import { statsApi, complaintsApi } from '@/lib/api';

export default function Profile() {
    const { user } = useAuth();

    const { data: statsData } = useQuery({
        queryKey: ['officer-stats'],
        queryFn: () => statsApi.getStats(),
    });

    const { data: resolvedData } = useQuery({
        queryKey: ['resolved-count', user?.id],
        queryFn: () => complaintsApi.getAssigned(user?.id || 0, { status: 'resolved', limit: 1 }),
        enabled: !!user?.id,
    });

    const stats = statsData?.stats;
    const resolvedCount = resolvedData?.count || 0;

    if (!user) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="page-header">My Profile</h1>
                <p className="text-muted-foreground -mt-4">Your officer profile and performance</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="lg:col-span-2">
                    <div className="bg-card border border-border rounded-lg p-6">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                                <User className="w-10 h-10 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-foreground">{user.name}</h2>
                                <p className="text-muted-foreground">{user.role === 'admin' ? 'Administrator' : 'Field Officer'}</p>
                                <p className="text-sm text-muted-foreground mt-1">{user.department}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                <Mail className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium text-foreground">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                <Phone className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Phone</p>
                                    <p className="font-medium text-foreground">{user.phone}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                <Building2 className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Department</p>
                                    <p className="font-medium text-foreground">{user.department || 'Not Assigned'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                <MapPin className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">District</p>
                                    <p className="font-medium text-foreground">{user.district?.name || 'Not Assigned'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Performance Stats */}
                <div className="space-y-4">
                    <div className="bg-card border border-border rounded-lg p-6">
                        <h3 className="font-semibold text-foreground mb-4">Performance</h3>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Cases Resolved</span>
                                <span className="font-bold text-2xl text-success">{resolvedCount}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Active Cases</span>
                                <span className="font-bold text-2xl text-primary">{stats?.inProgress || 0}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Critical Pending</span>
                                <span className="font-bold text-2xl text-critical">{stats?.critical || 0}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-lg p-6">
                        <h3 className="font-semibold text-foreground mb-2">SLA Compliance</h3>
                        <div className="flex items-end gap-2">
                            <span className="font-bold text-4xl text-foreground">{stats?.resolutionRate || 0}%</span>
                            <span className="text-muted-foreground mb-1">resolution rate</span>
                        </div>
                        <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-success rounded-full transition-all"
                                style={{ width: `${stats?.resolutionRate || 0}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
