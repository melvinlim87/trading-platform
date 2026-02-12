'use client';

import React from 'react';
import Header from '@/components/Header';
import TradingViewWidget from '@/components/TradingViewWidget';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function MarketsPage() {
    const { user, logout } = useAuth();
    const router = useRouter();

    return (
        <div className="flex flex-col min-h-screen bg-[#0a0e27]">
            <Header 
                userEmail={user?.email || 'Guest'} 
                onLogout={() => {
                    logout();
                    router.push('/auth/login');
                }}
            />
            
            <main className="flex-1 flex flex-col p-6 max-w-[1600px] mx-auto w-full gap-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold text-white tracking-tight">Market Exploration</h1>
                    <p className="text-textSecondary">Real-time charts and analysis across multiple asset classes</p>
                </div>

                <div className="flex-1 min-h-[600px] rounded-3xl overflow-hidden border border-white/5 shadow-2xl bg-[#0b0b12]">
                    <TradingViewWidget />
                </div>
            </main>

            <footer className="py-6 border-t border-white/5 text-center text-xs text-textSecondary">
                © 2026 Decyphers AI • Data provided by TradingView
            </footer>
        </div>
    );
}
