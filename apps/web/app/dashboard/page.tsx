'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { accountsAPI } from '@/lib/api';
import Link from 'next/link';
import Header from '@/components/Header';

export default function DashboardPage() {
    const { user, logout, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [accounts, setAccounts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Demo mode - load accounts even without login
        loadAccounts();
    }, []);

    const loadAccounts = async () => {
        try {
            const response = await accountsAPI.getAccounts();
            setAccounts(response.data);
        } catch (error) {
            console.error('Failed to load accounts', error);
            // Set demo accounts for preview
            setAccounts([
                { id: 'demo-1', type: 'Trading', currency: 'USD', balance: 50000 },
                { id: 'demo-2', type: 'Investment', currency: 'USD', balance: 25000 }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-2xl">Loading...</div>
            </div>
        );
    }

    const displayUser = user || { email: 'demo@preview.com' };

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#0a1628', color: '#e2e8f0' }}>
            <Header 
                userEmail={displayUser.email}
                onLogout={logout}
            />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
                    <p className="text-textSecondary">Here's your trading overview</p>
                </div>

                {/* Accounts */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {accounts.map((account) => (
                        <div key={account.id} className="card">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-semibold">
                                        {account.type === 'paper' ? '📝 Paper Account' : '💰 Live Account'}
                                    </h3>
                                    <p className="text-sm text-textSecondary">{account.currency}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm ${account.type === 'paper'
                                    ? 'bg-accentPrimary/20 text-accentPrimary'
                                    : 'bg-positive/20 text-positive'
                                    }`}>
                                    {account.type.toUpperCase()}
                                </span>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-textSecondary">Balance</span>
                                    <span className="text-2xl font-bold">
                                        ${parseFloat(account.balance).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-textSecondary">Positions</span>
                                    <span>{account.positions?.length || 0}</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-800">
                                <Link
                                    href={`/trade?account=${account.id}`}
                                    className="btn-primary w-full text-center block"
                                >
                                    Start Trading
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-4 gap-6">
                    <Link href="/portfolio" className="card hover:shadow-accentPrimary/20 transition-all cursor-pointer">
                        <div className="text-4xl mb-3">💼</div>
                        <h3 className="text-xl font-semibold mb-2">Portfolio</h3>
                        <p className="text-textSecondary">View your positions, P&L & AI Mentor</p>
                    </Link>

                    <Link href="/watchlist" className="card hover:shadow-accentPrimary/20 transition-all cursor-pointer">
                        <div className="text-4xl mb-3">📊</div>
                        <h3 className="text-xl font-semibold mb-2">Watchlist</h3>
                        <p className="text-textSecondary">Track your favorite assets</p>
                    </Link>

                    <div className="card opacity-60 cursor-not-allowed">
                        <div className="text-4xl mb-3">🏪</div>
                        <h3 className="text-xl font-semibold mb-2">Markets</h3>
                        <p className="text-textSecondary">Coming soon</p>
                    </div>

                    <div className="card opacity-60 cursor-not-allowed">
                        <div className="text-4xl mb-3">👥</div>
                        <h3 className="text-xl font-semibold mb-2">Community</h3>
                        <p className="text-textSecondary">Coming soon</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
