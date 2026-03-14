// frontend-admin/src/components/layout/AdminLayout.tsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    Users,
    AlertTriangle,
    Settings,
    LogOut,
    Menu,
    X,
} from 'lucide-react';
import { logout, getCurrentUser } from '../../services/adminService';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/complaints', icon: FileText, label: 'Complaints' },
    { path: '/pending', icon: AlertTriangle, label: 'Pending Review' },
    { path: '/officers', icon: Users, label: 'Officers' },
    { path: '/settings', icon: Settings, label: 'Settings' },
];

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const user = getCurrentUser();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <h1 className="sidebar-title">
                        {sidebarOpen ? 'TN Grievance' : 'TN'}
                    </h1>
                    <button
                        className="sidebar-toggle"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`nav-item ${isActive ? 'active' : ''}`}
                            >
                                <Icon size={20} />
                                {sidebarOpen && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div className="sidebar-footer">
                    <button className="nav-item logout" onClick={handleLogout}>
                        <LogOut size={20} />
                        {sidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <header className="admin-header">
                    <div className="header-left">
                        <h2>Admin Dashboard</h2>
                    </div>
                    <div className="header-right">
                        <span className="user-name">
                            {user?.name || 'Admin User'}
                            {user?.role && (
                                <span className="user-role">({user.role})</span>
                            )}
                        </span>
                    </div>
                </header>

                <div className="admin-content">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;

