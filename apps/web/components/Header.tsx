'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface HeaderProps {
    userEmail?: string;
    onAddPosition?: () => void;
    onAIImport?: () => void;
    onToggleHistory?: () => void;
    onLogout?: () => void;
    importHistoryCount?: number;
    showImportHistory?: boolean;
}

const Header: React.FC<HeaderProps> = ({
    userEmail,
    onAddPosition,
    onAIImport,
    onToggleHistory,
    onLogout,
    importHistoryCount = 0,
    showImportHistory = false
}) => {
    const pathname = usePathname();

    const navItems = [
        { label: 'Portfolio', href: '/portfolio' },
        { label: 'Watchlist', href: '/watchlist' },
        { label: 'Analysis', href: '/analysis' },
        { label: 'AI Mentor', href: '/ai-mentor' },
    ];

    return (
        <header style={{ backgroundColor: '#0d1f3c', borderBottom: '1px solid #1e3a5f', padding: '12px 0' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#00d4ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#0a1628' }}>D</span>
                    </div>
                    <div>
                        <h1 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#fff' }}>Decyphers</h1>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>AI Trading Mentor</p>
                    </div>
                </Link>
                
                <nav style={{ display: 'flex', gap: '32px', margin: '0 20px' }}>
                    {navItems.map((item) => (
                        <Link 
                            key={item.href} 
                            href={item.href} 
                            style={{ 
                                fontSize: '14px',
                                fontWeight: '500', 
                                color: pathname === item.href ? '#00d4ff' : '#64748b', 
                                textDecoration: 'none',
                                transition: 'color 0.2s'
                            }}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {onAddPosition && (
                        <button
                            onClick={onAddPosition}
                            style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', backgroundColor: '#1e3a5f', color: '#fff', border: '1px solid #3f4f66', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            ➕ Add Position
                        </button>
                    )}
                    {onAIImport && (
                        <button
                            onClick={onAIImport}
                            style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', backgroundColor: '#00d4ff', color: '#0a1628', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            📸 AI Import
                        </button>
                    )}
                    {onToggleHistory && (
                        <button
                            onClick={onToggleHistory}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: '500',
                                backgroundColor: showImportHistory ? '#3b82f622' : '#1e3a5f',
                                color: showImportHistory ? '#3b82f6' : '#94a3b8',
                                border: showImportHistory ? '1px solid #3b82f6' : '1px solid #3f4f66',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            📤 History {importHistoryCount > 0 && <span style={{ backgroundColor: '#3b82f6', color: '#fff', padding: '1px 6px', borderRadius: '10px', fontSize: '11px' }}>{importHistoryCount}</span>}
                        </button>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '12px', paddingLeft: '12px', borderLeft: '1px solid #1e3a5f' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontWeight: 'bold', color: '#000', fontSize: '12px' }}>{userEmail?.[0]?.toUpperCase() || '?'}</span>
                        </div>
                        {onLogout && (
                            <button 
                                onClick={onLogout}
                                style={{ 
                                    background: 'none', 
                                    border: 'none', 
                                    color: '#64748b', 
                                    fontSize: '12px', 
                                    cursor: 'pointer',
                                    padding: '4px 8px'
                                }}
                            >
                                Logout
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
