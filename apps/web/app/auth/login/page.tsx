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
        <div className="min-h-screen flex bg-[#0a1628]">
            <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-8 relative z-10">
                <div className="max-w-md w-full">
                    <div className="text-center mb-12">
                        <Link href="/" className="inline-flex items-center gap-3 mb-8 group transition-transform hover:scale-105">
                            <div className="w-12 h-12 rounded-xl bg-accentPrimary flex items-center justify-center shadow-lg shadow-accentPrimary/20">
                                <span className="text-2xl font-bold text-[#0a1628]">D</span>
                            </div>
                            <span className="text-2xl font-bold tracking-tight text-white">Decyphers</span>
                        </Link>
                        <h1 className="text-4xl font-extrabold mb-3 tracking-tight text-white">
                            Welcome Back
                        </h1>
                        <p className="text-textSecondary text-lg font-medium">Continue your trading journey</p>
                    </div>

                    <div className="glass-effect p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
                        {/* Subtle background glow inside card */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accentPrimary/5 blur-3xl pointer-events-none" />
                        
                        <form onSubmit={handleSubmit} className="space-y-6 relative">
                            {error && (
                                <div className="bg-negative/10 border border-negative/20 text-negative px-4 py-3 rounded-xl backdrop-blur-md flex items-start gap-3 animate-shake">
                                    <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm font-medium">{error}</span>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-sm font-bold text-white/70 ml-1">
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
                                        className="input-field w-full pl-12 h-14 bg-white/5 border-white/10 text-white focus:bg-white/[0.08] transition-all"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <label htmlFor="password" className="block text-sm font-bold text-white/70">
                                        Password
                                    </label>
                                    <a href="#" className="text-xs font-bold text-accentPrimary hover:underline">Forgot?</a>
                                </div>
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
                                        className="input-field w-full pl-12 pr-12 h-14 bg-white/5 border-white/10 text-white focus:bg-white/[0.08] transition-all"
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
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268-2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
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
                                className="btn-primary w-full h-14 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-accentPrimary/20 hover:shadow-accentPrimary/30 active:scale-95 group"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            <span>Verifying...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Sign In</span>
                                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </>
                                    )}
                                </span>
                            </button>
                        </form>

                        <div className="mt-10 pt-6 border-t border-white/5">
                            <p className="text-center text-sm font-medium text-textSecondary">
                                New to the platform?{' '}
                                <Link
                                    href="/auth/register"
                                    className="text-accentPrimary hover:text-accentSecondary transition-colors font-bold"
                                >
                                    Create An Account
                                </Link>
                            </p>
                        </div>
                    </div>

                    <p className="mt-8 text-center text-xs text-textSecondary font-medium">
                        Securely encrypted by Bank-Level SSL. © 2026 Decyphers.
                    </p>
                </div>
            </div>

            {/* Premium Split Screen Visual */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#0d1f3c] relative overflow-hidden items-center justify-center p-12">
                {/* Dynamic Background Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accentPrimary/10 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accentSecondary/10 rounded-full blur-[120px] -ml-64 -mb-64 animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                </div>

                <div className="relative z-10 text-center max-w-lg">
                    <div className="mb-12 relative inline-block">
                        <div className="absolute inset-0 bg-accentPrimary/20 blur-[64px] rounded-full animate-pulse" />
                        <div className="relative glass-effect p-8 rounded-[40px] border border-white/10 shadow-2xl overflow-hidden group">
                           <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-500">📈</div>
                           <div className="space-y-3">
                               <div className="h-2 w-32 bg-accentPrimary/30 rounded-full mx-auto" />
                               <div className="h-2 w-24 bg-white/10 rounded-full mx-auto" />
                               <div className="h-2 w-40 bg-accentSecondary/20 rounded-full mx-auto" />
                           </div>
                        </div>
                    </div>
                    
                    <h2 className="text-5xl font-extrabold mb-6 tracking-tight text-white leading-tight">
                        Built for <span className="gold-gradient-text">Excellence</span>
                    </h2>
                    <p className="text-xl text-textSecondary mb-12 leading-relaxed font-medium">
                        Join the next generation of professional traders leveraging AI to outpace the market.
                    </p>

                    <div className="grid gap-4">
                        <div className="glass-effect p-6 rounded-2xl border border-white/5 flex items-center gap-5 text-left group hover:border-accentPrimary/30 transition-colors">
                            <div className="w-12 h-12 rounded-xl bg-accentPrimary/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">⚡</div>
                            <div>
                                <h3 className="font-bold text-white text-lg">Ultra-Fast Execution</h3>
                                <p className="text-sm text-textSecondary font-medium">Real-time market updates under 50ms</p>
                            </div>
                        </div>
                        <div className="glass-effect p-6 rounded-2xl border border-white/5 flex items-center gap-5 text-left group hover:border-accentSecondary/30 transition-colors">
                            <div className="w-12 h-12 rounded-xl bg-accentSecondary/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🤖</div>
                            <div>
                                <h3 className="font-bold text-white text-lg">AI Performance Review</h3>
                                <p className="text-sm text-textSecondary font-medium">Automated analysis of every trade you make</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
