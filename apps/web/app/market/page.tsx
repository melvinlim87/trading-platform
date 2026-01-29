'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import TradingViewWidget from '@/components/TradingViewWidget';

export default function MarketPage() {
    
    return (
        <div className="min-h-screen bg-bgSecondary text-textPrimary">
            <Header />
            <main className="max-w-[1600px] mx-auto px-4 py-8 h-[calc(100vh-80px)]">
                <div className="flex flex-col h-full gap-6">

                    {/* Chart Display */}
                    <div className="card flex-1 rounded-xl overflow-hidden glass-effect border border-bgTertiary p-4 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-accentPrimary/5 via-transparent to-accentSecondary/5 pointer-events-none" />
                        <div className="h-full w-full relative z-10">
                            <TradingViewWidget />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
