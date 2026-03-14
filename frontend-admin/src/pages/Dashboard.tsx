// frontend-admin/src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import {
    FileText,
    Clock,
    AlertTriangle,
    CheckCircle2,
    Timer,
    Users,
} from 'lucide-react';
import KPICard from '../components/dashboard/KPICard';
import ComplaintsTable from '../components/dashboard/ComplaintsTable';
import { getStats, getComplaints, AdminStats, Complaint } from '../services/adminService';

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [statsData, complaintsData] = await Promise.all([
                    getStats(),
                    getComplaints({ limit: 5 }),
                ]);
                setStats(statsData);
                setRecentComplaints(complaintsData.data);
                setError(null);
            } catch (err) {
                console.error('Dashboard fetch error:', err);
                setError('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // Refresh every 30 seconds
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <AlertTriangle size={48} />
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Retry</button>
            </div>
        );
    }

    return (
        <div className="dashboard-page animate-fade-in">
            {/* Page Header */}
            <div className="page-header">
                <h1>Dashboard Overview</h1>
                <p className="subtitle">
                    Welcome back! Here's what's happening across the state.
                </p>
            </div>

            {/* KPI Cards */}
            <div className="kpi-grid">
                <KPICard
                    title="Total Complaints"
                    value={stats?.stats.total || 0}
                    icon={FileText}
                    variant="primary"
                />
                <KPICard
                    title="Pending Review"
                    value={stats?.stats.pendingReview || 0}
                    icon={Clock}
                    variant="warning"
                />
                <KPICard
                    title="Critical"
                    value={stats?.stats.critical || 0}
                    icon={AlertTriangle}
                    variant="critical"
                />
                <KPICard
                    title="In Progress"
                    value={stats?.stats.inProgress || 0}
                    icon={Timer}
                    variant="default"
                />
                <KPICard
                    title="Resolved"
                    value={stats?.stats.resolved || 0}
                    icon={CheckCircle2}
                    variant="success"
                />
                <KPICard
                    title="Today"
                    value={stats?.stats.todayCount || 0}
                    icon={Users}
                    variant="primary"
                />
            </div>

            {/* Charts Row */}
            <div className="charts-row">
                <div className="chart-card">
                    <h3>Priority Distribution</h3>
                    <div className="chart-content">
                        {stats?.distributions.byPriority.map((item) => (
                            <div key={item.priority} className="chart-bar-item">
                                <span className={`priority-label ${item.priority.toLowerCase()}`}>
                                    {item.priority}
                                </span>
                                <div className="bar-container">
                                    <div
                                        className={`bar priority-${item.priority.toLowerCase()}`}
                                        style={{
                                            width: `${(Number(item.count) / (stats?.stats.total || 1)) * 100}%`,
                                        }}
                                    />
                                </div>
                                <span className="count">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="chart-card">
                    <h3>Category Distribution</h3>
                    <div className="chart-content">
                        {stats?.distributions.byCategory.map((item) => (
                            <div key={item.category} className="chart-bar-item">
                                <span className="category-label">{item.category}</span>
                                <div className="bar-container">
                                    <div
                                        className="bar category-bar"
                                        style={{
                                            width: `${(Number(item.count) / (stats?.stats.total || 1)) * 100}%`,
                                        }}
                                    />
                                </div>
                                <span className="count">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Complaints Table */}
            <div className="section-card">
                <div className="section-header">
                    <h3>Recent Complaints</h3>
                    <a href="/complaints" className="view-all">View All →</a>
                </div>
                <ComplaintsTable complaints={recentComplaints} limit={5} />
            </div>
        </div>
    );
};

export default Dashboard;
