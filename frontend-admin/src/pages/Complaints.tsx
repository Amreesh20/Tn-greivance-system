// frontend-admin/src/pages/Complaints.tsx
import React, { useEffect, useState } from 'react';
import { Search, Filter, RefreshCw } from 'lucide-react';
import ComplaintsTable from '../components/dashboard/ComplaintsTable';
import { getComplaints, Complaint } from '../services/adminService';

const categories = [
    { value: '', label: 'All Categories' },
    { value: 'PUBLIC_WORKS', label: 'Public Works' },
    { value: 'WATER_SUPPLY', label: 'Water Supply' },
    { value: 'SANITATION', label: 'Sanitation' },
    { value: 'HEALTH', label: 'Health' },
    { value: 'EDUCATION', label: 'Education' },
    { value: 'ELECTRICITY', label: 'Electricity' },
    { value: 'GENERAL', label: 'General' },
    { value: 'UNVERIFIED', label: 'Unverified' },
];

const priorities = [
    { value: '', label: 'All Priorities' },
    { value: 'CRITICAL', label: 'Critical' },
    { value: 'HIGH', label: 'High' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'LOW', label: 'Low' },
];

const statuses = [
    { value: '', label: 'All Statuses' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'acknowledged', label: 'Acknowledged' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'closed', label: 'Closed' },
];

const Complaints: React.FC = () => {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({
        category: '',
        priority: '',
        status: '',
        search: '',
    });
    const limit = 20;

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            const params: any = {
                limit,
                offset: (page - 1) * limit,
            };
            if (filters.category) params.category = filters.category;
            if (filters.priority) params.priority = filters.priority;
            if (filters.status) params.status = filters.status;

            const data = await getComplaints(params);
            setComplaints(data.data);
            setTotalCount(data.count);
        } catch (error) {
            console.error('Failed to fetch complaints:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, [page, filters]);

    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setPage(1);
    };

    const totalPages = Math.ceil(totalCount / limit);

    return (
        <div className="complaints-page animate-fade-in">
            {/* Page Header */}
            <div className="page-header">
                <h1>All Complaints</h1>
                <p className="subtitle">Manage and monitor all grievance complaints</p>
            </div>

            {/* Filters Bar */}
            <div className="filters-bar">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search complaints..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <Filter size={18} />
                    <select
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                    >
                        {categories.map((cat) => (
                            <option key={cat.value} value={cat.value}>
                                {cat.label}
                            </option>
                        ))}
                    </select>

                    <select
                        value={filters.priority}
                        onChange={(e) => handleFilterChange('priority', e.target.value)}
                    >
                        {priorities.map((pri) => (
                            <option key={pri.value} value={pri.value}>
                                {pri.label}
                            </option>
                        ))}
                    </select>

                    <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                    >
                        {statuses.map((stat) => (
                            <option key={stat.value} value={stat.value}>
                                {stat.label}
                            </option>
                        ))}
                    </select>
                </div>

                <button className="refresh-btn" onClick={fetchComplaints}>
                    <RefreshCw size={18} />
                    Refresh
                </button>
            </div>

            {/* Stats Summary */}
            <div className="results-summary">
                <span>Showing {complaints.length} of {totalCount} complaints</span>
            </div>

            {/* Table */}
            <div className="section-card">
                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Loading complaints...</p>
                    </div>
                ) : (
                    <ComplaintsTable complaints={complaints} />
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                    >
                        Previous
                    </button>
                    <span>
                        Page {page} of {totalPages}
                    </span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default Complaints;
