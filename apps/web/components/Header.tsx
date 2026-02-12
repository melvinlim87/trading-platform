'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

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
    const router = useRouter();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const navItems = [
        { label: 'Portfolio', href: '/portfolio' },
        { label: 'Watchlist', href: '/watchlist' },
        { label: 'Markets', href: '/markets' },
        { label: 'Analysis', href: '/analysis' },
        { label: 'AI Mentor', href: '/ai-mentor' },
        { label: 'Morning Brief', href: '/morning-brief' },
    ];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDropdown]);

    const handleSettingsClick = () => {
        setShowDropdown(false);
        router.push('/settings');
    };

    const handleLogoutClick = () => {
        setShowDropdown(false);
        if (onLogout) {
            onLogout();
        }
    };

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
                    
                    {/* User Profile Dropdown */}
                    <div ref={dropdownRef} style={{ position: 'relative', marginLeft: '12px', paddingLeft: '12px', borderLeft: '1px solid #1e3a5f' }}>
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: '#f59e0b',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                transform: showDropdown ? 'scale(1.1)' : 'scale(1)'
                            }}
                        >
                            <span style={{ fontWeight: 'bold', color: '#000', fontSize: '12px' }}>
                                {userEmail?.[0]?.toUpperCase() || '?'}
                            </span>
                        </button>

                        {/* Dropdown Menu */}
                        {showDropdown && (
                            <div style={{
                                position: 'absolute',
                                top: '45px',
                                right: '0',
                                backgroundColor: '#0d1f3c',
                                border: '1px solid #1e3a5f',
                                borderRadius: '12px',
                                minWidth: '200px',
                                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                                zIndex: 1000,
                                overflow: 'hidden'
                            }}>
                                {/* User Info */}
                                <div style={{
                                    padding: '16px',
                                    borderBottom: '1px solid #1e3a5f',
                                    backgroundColor: '#0a1628'
                                }}>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '4px' }}>
                                        {userEmail || 'User'}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                                        Trader Account
                                    </div>
                                </div>

                                {/* Menu Items */}
                                <div style={{ padding: '8px 0' }}>
                                    <button
                                        onClick={handleSettingsClick}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            backgroundColor: 'transparent',
                                            border: 'none',
                                            color: '#e2e8f0',
                                            fontSize: '14px',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            transition: 'background-color 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e3a5f'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <span style={{ fontSize: '16px' }}>⚙️</span>
                                        <span>Settings</span>
                                    </button>

                                    <button
                                        onClick={handleLogoutClick}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            backgroundColor: 'transparent',
                                            border: 'none',
                                            color: '#ef4444',
                                            fontSize: '14px',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            transition: 'background-color 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e3a5f'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <span style={{ fontSize: '16px' }}>🚪</span>
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
