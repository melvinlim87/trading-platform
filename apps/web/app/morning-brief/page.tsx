'use client';

import React from 'react';
import Header from '@/components/Header';
import { MorningBrief } from '@/components/MorningBrief';
import { useAuth } from '@/contexts/AuthContext';

export default function MorningBriefPage() {
    const { user, logout } = useAuth();

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0a1628', color: '#e2e8f0', fontFamily: 'Inter, system-ui, sans-serif' }}>
            <Header userEmail={user?.email || ''} onLogout={logout} />
            <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
                <MorningBrief />
            </main>
        </div>
    );
}
