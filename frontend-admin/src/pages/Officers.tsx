// frontend-admin/src/pages/Officers.tsx
import React, { useEffect, useState } from 'react';
import { Users, Star, Briefcase, RefreshCw, MapPin } from 'lucide-react';
import KPICard from '../components/dashboard/KPICard';
import { getOfficers, Officer } from '../services/adminService';

const Officers: React.FC = () => {
    const [officers, setOfficers] = useState<Officer[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        department: '',
        isActive: 'true',
    });

    const departments = [
        { value: '', label: 'All Departments' },
        { value: 'PUBLIC_WORKS', label: 'Public Works' },
        { value: 'WATER_SUPPLY', label: 'Water Supply' },
        { value: 'SANITATION', label: 'Sanitation' },
        { value: 'HEALTH', label: 'Health' },
        { value: 'EDUCATION', label: 'Education' },
        { value: 'ELECTRICITY', label: 'Electricity' },
    ];

    const fetchOfficers = async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (filters.department) params.department = filters.department;
            params.isActive = filters.isActive;

            const data = await getOfficers(params);
            setOfficers(data.data);
        } catch (error) {
            console.error('Failed to fetch officers:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOfficers();
    }, [filters]);

    const totalOfficers = officers.length;
    const activeOfficers = officers.filter((o) => o.isActive).length;
    const avgWorkload =
        officers.length > 0
            ? Math.round(
                officers.reduce((acc, o) => acc + o.currentWorkload, 0) / officers.length
            )
            : 0;
    const highWorkload = officers.filter((o) => o.currentWorkload > 10).length;

    return (
        <div className="officers-page animate-fade-in">
            {/* Page Header */}
            <div className="page-header">
                <h1>Officer Management</h1>
                <p className="subtitle">Monitor officer workload and performance</p>
            </div>

            {/* KPI Cards */}
            <div className="kpi-grid">
                <KPICard
                    title="Total Officers"
                    value={totalOfficers}
                    icon={Users}
                    variant="primary"
                />
                <KPICard
                    title="Active Officers"
                    value={activeOfficers}
                    icon={Users}
                    variant="success"
                />
                <KPICard
                    title="Avg. Workload"
                    value={`${avgWorkload} cases`}
                    icon={Briefcase}
                    variant="default"
                />
                <KPICard
                    title="High Workload"
                    value={highWorkload}
                    icon={Star}
                    variant="warning"
                />
            </div>

            {/* Filters Bar */}
            <div className="filters-bar">
                <div className="filter-group">
                    <select
                        value={filters.department}
                        onChange={(e) =>
                            setFilters((f) => ({ ...f, department: e.target.value }))
                        }
                    >
                        {departments.map((dept) => (
                            <option key={dept.value} value={dept.value}>
                                {dept.label}
                            </option>
                        ))}
                    </select>

                    <select
                        value={filters.isActive}
                        onChange={(e) =>
                            setFilters((f) => ({ ...f, isActive: e.target.value }))
                        }
                    >
                        <option value="true">Active Only</option>
                        <option value="false">Inactive Only</option>
                        <option value="">All</option>
                    </select>
                </div>

                <button className="refresh-btn" onClick={fetchOfficers}>
                    <RefreshCw size={18} />
                    Refresh
                </button>
            </div>

            {/* Officers Table */}
            <div className="section-card">
                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Loading officers...</p>
                    </div>
                ) : (
                    <div className="officers-table-wrapper">
                        <table className="officers-table">
                            <thead>
                                <tr>
                                    <th>Officer</th>
                                    <th>Department</th>
                                    <th>District</th>
                                    <th>Current Workload</th>
                                    <th>Status</th>
                                    <th>Contact</th>
                                </tr>
                            </thead>
                            <tbody>
                                {officers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="no-data">
                                            No officers found
                                        </td>
                                    </tr>
                                ) : (
                                    officers.map((officer) => (
                                        <tr key={officer.id}>
                                            <td>
                                                <div className="officer-name">
                                                    <div className="avatar">
                                                        {officer.name
                                                            .split(' ')
                                                            .map((n) => n[0])
                                                            .join('')}
                                                    </div>
                                                    <span>{officer.name}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="department-badge">
                                                    {officer.department || 'General'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="district-cell">
                                                    <MapPin size={14} />
                                                    {officer.district?.name || officer.districtId}
                                                </div>
                                            </td>
                                            <td>
                                                <span
                                                    className={`workload-badge ${officer.currentWorkload > 12
                                                            ? 'high'
                                                            : officer.currentWorkload > 6
                                                                ? 'medium'
                                                                : 'low'
                                                        }`}
                                                >
                                                    {officer.currentWorkload} cases
                                                </span>
                                            </td>
                                            <td>
                                                <span
                                                    className={`status-indicator ${officer.isActive ? 'active' : 'inactive'
                                                        }`}
                                                >
                                                    {officer.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="contact-cell">
                                                <div>{officer.email}</div>
                                                <div className="phone">{officer.phone}</div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Officers;
