import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { complaintsApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { Complaint } from '@/types';

export default function Completed() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const { data, isLoading } = useQuery({
        queryKey: ['completed-complaints', user?.id],
        queryFn: () => complaintsApi.getAssigned(user?.id || 0, {
            limit: 50,
            status: 'resolved',
            sortBy: 'resolvedAt',
            sortOrder: 'DESC',
        }),
        enabled: !!user?.id,
    });

    const complaints = data?.data || [];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="page-header">Completed Complaints</h1>
                <p className="text-muted-foreground -mt-4">
                    {complaints.length} resolved complaints
                </p>
            </div>

            {complaints.length === 0 ? (
                <div className="bg-card border border-border rounded-lg p-12 text-center">
                    <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No completed complaints yet.</p>
                    <Button variant="link" onClick={() => navigate('/complaints')}>
                        View Active Complaints
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {complaints.map((complaint: Complaint) => (
                        <div
                            key={complaint.id}
                            className="bg-card border border-border rounded-lg p-6 hover:border-success/50 transition-colors cursor-pointer"
                            onClick={() => navigate(`/complaints/${complaint.id}`)}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-foreground">#{complaint.id}</span>
                                        <PriorityBadge priority={complaint.priority} />
                                    </div>
                                    <p className="text-sm text-muted-foreground">{complaint.category}</p>
                                </div>
                                <div className="flex items-center gap-1 text-success">
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="text-sm font-medium">Resolved</span>
                                </div>
                            </div>

                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                {complaint.text}
                            </p>

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                    {complaint.district?.name || 'Unknown District'}
                                </span>
                                {complaint.resolvedAt && (
                                    <span className="text-muted-foreground">
                                        {new Date(complaint.resolvedAt).toLocaleDateString()}
                                    </span>
                                )}
                            </div>

                            {complaint.resolution && (
                                <div className="mt-4 pt-4 border-t border-border">
                                    <p className="text-sm text-muted-foreground">
                                        <span className="font-medium">Resolution:</span> {complaint.resolution}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
