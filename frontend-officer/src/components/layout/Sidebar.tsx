import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    ClipboardList,
    AlertTriangle,
    CheckCircle,
    User,
    Shield,
} from 'lucide-react';

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/complaints', icon: ClipboardList, label: 'Assigned Complaints' },
    { to: '/complaints?priority=CRITICAL', icon: AlertTriangle, label: 'Critical Complaints' },
    { to: '/completed', icon: CheckCircle, label: 'Completed' },
    { to: '/profile', icon: User, label: 'My Profile' },
];

export function Sidebar() {
    const location = useLocation();

    const isActive = (path: string) => {
        if (path.includes('?')) {
            return location.pathname + location.search === path;
        }
        return location.pathname === path && !location.search.includes('priority');
    };

    return (
        <aside className="w-64 bg-sidebar min-h-screen flex flex-col">
            <div className="p-6 border-b border-sidebar-border">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center">
                        <Shield className="w-6 h-6 text-sidebar-primary-foreground" />
                    </div>
                    <div>
                        <h1 className="text-sidebar-foreground font-semibold text-sm">SPGRS</h1>
                        <p className="text-sidebar-foreground/60 text-xs">Officer Portal</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 py-4">
                <ul className="space-y-1">
                    {navItems.map((item) => (
                        <li key={item.to}>
                            <NavLink
                                to={item.to}
                                className={`nav-item ${isActive(item.to) ? 'nav-item-active' : ''}`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="text-sm font-medium">{item.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="p-4 border-t border-sidebar-border">
                <p className="text-sidebar-foreground/40 text-xs text-center">
                    v1.0.0 • TN Grievance System
                </p>
            </div>
        </aside>
    );
}
