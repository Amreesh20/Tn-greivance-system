import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { SLATimer } from '@/components/shared/SLATimer';
import { complaintsApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { Complaint, Priority, Status } from '@/types';

export default function Complaints() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const initialPriority = searchParams.get('priority') as Priority | null;

    const [search, setSearch] = useState('');
    const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>(initialPriority || 'all');
    const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');

    // Fetch assigned complaints
    const { data, isLoading } = useQuery({
        queryKey: ['complaints', user?.id, priorityFilter, statusFilter],
        queryFn: () => complaintsApi.getAssigned(user?.id || 0, {
            limit: 50,
            priority: priorityFilter !== 'all' ? priorityFilter : undefined,
            status: statusFilter !== 'all' ? statusFilter : undefined,
            sortBy: 'createdAt',
            sortOrder: 'DESC',
        }),
        enabled: !!user?.id,
    });

    const complaints = data?.data || [];

    const filteredComplaints = useMemo(() => {
        if (!search) return complaints;

        return complaints.filter((complaint: Complaint) => {
            const searchLower = search.toLowerCase();
            return (
                complaint.id.toString().includes(searchLower) ||
                complaint.text.toLowerCase().includes(searchLower) ||
                complaint.category.toLowerCase().includes(searchLower) ||
                complaint.district?.name?.toLowerCase().includes(searchLower)
            );
        });
    }, [complaints, search]);

    const pageTitle = initialPriority === 'CRITICAL' ? 'Critical Complaints' : 'Assigned Complaints';

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
                <h1 className="page-header">{pageTitle}</h1>
                <p className="text-muted-foreground -mt-4">
                    {filteredComplaints.length} complaints found
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                        placeholder="Search by ID, description, or district..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 h-11"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-muted-foreground" />
                    <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as Priority | 'all')}>
                        <SelectTrigger className="w-36 h-11">
                            <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Priorities</SelectItem>
                            <SelectItem value="CRITICAL">Critical</SelectItem>
                            <SelectItem value="HIGH">High</SelectItem>
                            <SelectItem value="MEDIUM">Medium</SelectItem>
                            <SelectItem value="LOW">Low</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as Status | 'all')}>
                        <SelectTrigger className="w-36 h-11">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="acknowledged">Acknowledged</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Complaints Table */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">ID</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Category</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">District</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Priority</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">SLA</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filteredComplaints.map((complaint: Complaint) => (
                            <tr key={complaint.id} className="hover:bg-muted/30 transition-colors">
                                <td className="px-4 py-4">
                                    <span className="font-medium text-foreground">#{complaint.id}</span>
                                </td>
                                <td className="px-4 py-4 text-muted-foreground">{complaint.category}</td>
                                <td className="px-4 py-4">
                                    <div>
                                        <p className="text-sm text-foreground">{complaint.district?.name || 'Unknown'}</p>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <PriorityBadge priority={complaint.priority} />
                                </td>
                                <td className="px-4 py-4">
                                    <StatusBadge status={complaint.status} />
                                </td>
                                <td className="px-4 py-4">
                                    <SLATimer createdAt={complaint.createdAt} slaHours={complaint.slaHours} />
                                </td>
                                <td className="px-4 py-4">
                                    <Button
                                        size="sm"
                                        onClick={() => navigate(`/complaints/${complaint.id}`)}
                                    >
                                        View Details
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredComplaints.length === 0 && (
                    <div className="p-12 text-center">
                        <p className="text-muted-foreground">No complaints found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
