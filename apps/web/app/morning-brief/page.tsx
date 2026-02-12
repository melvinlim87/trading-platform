'use client';

import React from 'react';
import Header from '@/components/Header';
import { MorningBrief } from '@/components/MorningBrief';

export default function MorningBriefPage() {
    const handleScheduleChange = (enabled: boolean, time: string) => {
        console.log(`Morning brief schedule ${enabled ? 'enabled' : 'disabled'} for ${time}`);
        // TODO: Implement API call to save schedule settings
        // This would typically call your backend to set up a cron job or scheduled task
        // Example: await fetch('/api/morning-brief/schedule', { method: 'POST', body: JSON.stringify({ enabled, time }) });
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0a1628', color: '#e2e8f0', fontFamily: 'Inter, system-ui, sans-serif' }}>
            <Header userEmail="demo@preview.com" />
            <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
                <MorningBrief onScheduleChange={handleScheduleChange} />
            </main>
        </div>
    );
}
