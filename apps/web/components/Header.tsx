'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
    onAddPosition?: () => void;
    onImport?: () => void;
}

export default function Header({ onAddPosition, onImport }: HeaderProps) {
    const { user, logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const displayUser = user || { email: 'demo@preview.com' };

    const isActive = (path: string) => pathname === path;

    return (
        <header style={{ backgroundColor: '#000000', borderBottom: '1px solid rgba(212, 175, 55, 0.3)', padding: '12px 0' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Link href="dashboard">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-accentPrimary via-yellow-100 to-accentSecondary bg-clip-text text-transparent">
                            Trading Platform
                        </h1>
                    </Link>
                </div>
                <nav style={{ display: 'flex', gap: '32px' }}>
                    <Link href="/portfolio" style={{
                        fontWeight: '500',
                        color: isActive('/portfolio') ? '#D4AF37' : '#9ca3af',
                        textDecoration: 'none'
                    }}>Portfolio</Link>
                    <Link href="/watchlist" style={{
                        fontWeight: '500',
                        color: isActive('/watchlist') ? '#D4AF37' : '#9ca3af',
                        textDecoration: 'none'
                    }}>Watchlist</Link>
                    <Link href="/analysis" style={{
                        fontWeight: '500',
                        color: isActive('/analysis') ? '#D4AF37' : '#9ca3af',
                        textDecoration: 'none'
                    }}>Analysis</Link>
                    <Link href="/ai-mentor" style={{
                        fontWeight: '500',
                        color: isActive('/ai-mentor') ? '#D4AF37' : '#9ca3af',
                        textDecoration: 'none'
                    }}>AI Mentor</Link>
                    <Link href="/market" style={{
                        fontWeight: '500',
                        color: isActive('/market') ? '#D4AF37' : '#9ca3af',
                        textDecoration: 'none'
                    }}>Market</Link>
                </nav>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {onAddPosition && (
                        <button
                            onClick={onAddPosition}
                            style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', backgroundColor: '#171717', color: '#fff', border: '1px solid #333', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            ➕ Add Position
                        </button>
                    )}
                    {onImport && (
                        <button
                            onClick={onImport}
                            style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', backgroundColor: '#D4AF37', color: '#000000', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            📸 AI Import
                        </button>
                    )}
                    <div
                        ref={dropdownRef}
                        style={{ position: 'relative' }}
                    >
                        <div
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            style={{
                                width: '36px', height: '36px', borderRadius: '50%',
                                backgroundColor: '#f59e0b', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: isDropdownOpen ? '0 0 0 2px #fff' : 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            <span style={{ fontWeight: 'bold', color: '#000' }}>{displayUser.email?.[0]?.toUpperCase()}</span>
                        </div>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                marginTop: '8px',
                                width: '180px',
                                backgroundColor: '#171717',
                                borderRadius: '8px',
                                border: '1px solid #333',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
                                zIndex: 50,
                                overflow: 'hidden'
                            }}>
                                <div style={{ padding: '12px 16px', borderBottom: '1px solid #333' }}>
                                    <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>Signed in as</p>
                                    <p style={{ fontSize: '13px', color: '#fff', fontWeight: '500', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {displayUser.email}
                                    </p>
                                </div>
                                <div style={{ padding: '4px' }}>
                                    <Link href="/settings" style={{
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        padding: '8px 12px', fontSize: '13px', color: '#e2e8f0',
                                        textDecoration: 'none', borderRadius: '4px',
                                        transition: 'background-color 0.2s'
                                    }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#262626'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <span>⚙️</span> Settings
                                    </Link>
                                    <button
                                        onClick={() => logout()}
                                        style={{
                                            width: '100%', textAlign: 'left',
                                            display: 'flex', alignItems: 'center', gap: '8px',
                                            padding: '8px 12px', fontSize: '13px', color: '#ef4444',
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            borderRadius: '4px', transition: 'background-color 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#262626'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <span>🚪</span> Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
