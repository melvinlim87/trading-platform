'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid credentials');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                <div className="max-w-md w-full">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-accentPrimary/20 to-accentSecondary/20 backdrop-blur-sm border border-accentPrimary/30">
                            <svg className="w-8 h-8 text-accentPrimary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-accentPrimary via-yellow-100 to-accentSecondary bg-clip-text text-transparent">
                            Welcome Back
                        </h1>
                        <p className="text-textSecondary text-base">Sign in to continue trading</p>
                    </div>

                    <div className="card relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-accentPrimary/5 via-transparent to-accentSecondary/5 pointer-events-none" />

                        <form onSubmit={handleSubmit} className="space-y-6 relative">
                            {error && (
                                <div className="bg-negative/10 border border-negative/50 text-negative px-4 py-3 rounded-lg animate-pulse backdrop-blur-sm flex items-start gap-3">
                                    <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm">{error}</span>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-sm font-semibold text-textPrimary">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-textSecondary group-focus-within:text-accentPrimary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                        </svg>
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="input-field w-full pl-12 h-12 text-base transition-all duration-200 focus:pl-12 focus:scale-[1.01]"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="password" className="block text-sm font-semibold text-textPrimary">
                                    Password
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-textSecondary group-focus-within:text-accentPrimary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="input-field w-full pl-12 pr-12 h-12 text-base transition-all duration-200 focus:scale-[1.01]"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-textSecondary hover:text-accentPrimary transition-colors"
                                    >
                                        {showPassword ? (
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn-primary w-full h-12 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            <span>Signing in...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Sign In</span>
                                        </>
                                    )}
                                </span>
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-bgTertiary">
                            <p className="text-center text-sm text-textSecondary">
                                Don't have an account?{' '}
                                <Link
                                    href="/auth/register"
                                    className="text-accentPrimary hover:text-accentSecondary font-semibold transition-colors hover:underline"
                                >
                                    Create account
                                </Link>
                            </p>
                        </div>
                    </div>

                    <p className="mt-8 text-center text-xs text-textSecondary">
                        By signing in, you agree to our Terms of Service and Privacy Policy
                    </p>
                </div>
            </div>

            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-bgSecondary via-bgPrimary to-bgSecondary relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-accentPrimary rounded-full filter blur-[128px]" />
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-accentSecondary rounded-full filter blur-[128px]" />
                </div>

                <div className="relative z-10 flex flex-col justify-center px-16 text-center">
                    <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-accentPrimary via-yellow-100 to-accentSecondary bg-clip-text text-transparent">
                        Start Trading Today
                    </h2>
                    <p className="text-xl text-textSecondary mb-12 leading-relaxed">
                        Join thousands of traders managing their portfolios with real-time market data and advanced analytics
                    </p>

                    <div className="grid gap-6 max-w-md mx-auto w-full">
                        <div className="flex items-start gap-4 text-left glass-effect p-6 rounded-xl backdrop-blur-sm">
                            <div className="flex-shrink-0 w-12 h-12 bg-accentPrimary/20 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-accentPrimary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-textPrimary mb-1">Real-Time Data</h3>
                                <p className="text-sm text-textSecondary">Live market prices and portfolio updates</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 text-left glass-effect p-6 rounded-xl backdrop-blur-sm">
                            <div className="flex-shrink-0 w-12 h-12 bg-accentSecondary/20 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-accentSecondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-textPrimary mb-1">Advanced Tools</h3>
                                <p className="text-sm text-textSecondary">Professional charts and analytics</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 text-left glass-effect p-6 rounded-xl backdrop-blur-sm">
                            <div className="flex-shrink-0 w-12 h-12 bg-positive/20 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-positive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-textPrimary mb-1">Secure Platform</h3>
                                <p className="text-sm text-textSecondary">Bank-level security for your data</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
