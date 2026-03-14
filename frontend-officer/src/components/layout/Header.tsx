import { LogOut, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
            <div>
                <h2 className="text-lg font-semibold text-foreground">
                    Welcome back, {user?.name || 'Officer'}
                </h2>
                <p className="text-sm text-muted-foreground">
                    {user?.department || 'Department'} • {user?.district?.name || 'District'}
                </p>
            </div>

            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/profile')}
                    className="flex items-center gap-2"
                >
                    <User className="w-4 h-4" />
                    Profile
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="flex items-center gap-2"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </Button>
            </div>
        </header>
    );
}
