import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error('Please enter email and password');
            return;
        }

        setIsLoading(true);
        try {
            const success = await login(email, password);
            if (success) {
                toast.success('Login successful');
                navigate('/dashboard');
            } else {
                toast.error('Invalid credentials');
            }
        } catch (error) {
            toast.error('Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center p-12">
                <div className="max-w-md text-center">
                    <div className="w-20 h-20 bg-primary-foreground/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
                        <Shield className="w-12 h-12 text-primary-foreground" />
                    </div>
                    <h1 className="text-3xl font-bold text-primary-foreground mb-4">
                        Smart Public Grievance Resolution System
                    </h1>
                    <p className="text-primary-foreground/80 text-lg">
                        Officer Portal for efficient complaint management and resolution
                    </p>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="lg:hidden text-center mb-8">
                        <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                            <Shield className="w-10 h-10 text-primary-foreground" />
                        </div>
                        <h1 className="text-2xl font-bold text-foreground">SPGRS</h1>
                        <p className="text-muted-foreground">Officer Portal</p>
                    </div>

                    <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
                        <div className="mb-6">
                            <h2 className="text-2xl font-semibold text-foreground">Officer Login</h2>
                            <p className="text-muted-foreground mt-1">Enter your credentials to access the dashboard</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="email">Officer ID / Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="officer@tngov.in"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-12"
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-12 pr-12"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <Button type="submit" className="w-full h-12 text-base font-medium" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                        Logging in...
                                    </>
                                ) : (
                                    'Login to Dashboard'
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground mb-2">Demo Credentials:</p>
                            <p className="text-xs text-muted-foreground">Email: officer.chennai@tngov.in</p>
                            <p className="text-xs text-muted-foreground">Password: Officer@123</p>
                        </div>

                        <p className="text-center text-sm text-muted-foreground mt-6">
                            Forgot password?{' '}
                            <a href="#" className="text-primary hover:underline">
                                Contact Admin
                            </a>
                        </p>
                    </div>

                    <p className="text-center text-xs text-muted-foreground mt-6">
                        © 2026 TN Grievance System. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
