'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';

interface UserProfile {
    name: string;
    email: string;
    countryCode: string;
    mobileNumber: string;
    telegramLinked: boolean;
    telegramUsername?: string;
}

export default function SettingsPage() {
    const [profile, setProfile] = useState<UserProfile>({
        name: 'John Trader',
        email: 'demo@preview.com',
        countryCode: '+1',
        mobileNumber: '5551234567',
        telegramLinked: false,
        telegramUsername: ''
    });

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showTelegramModal, setShowTelegramModal] = useState(false);

    const countryCodes = [
        { code: '+1', country: 'US/Canada' },
        { code: '+44', country: 'UK' },
        { code: '+65', country: 'Singapore' },
        { code: '+86', country: 'China' },
        { code: '+60', country: 'Malaysia' },
        { code: '+62', country: 'Indonesia' },
        { code: '+63', country: 'Philippines' },
        { code: '+66', country: 'Thailand' },
        { code: '+81', country: 'Japan' },
        { code: '+82', country: 'South Korea' },
        { code: '+91', country: 'India' },
    ];

    const handleInputChange = (field: keyof UserProfile, value: string) => {
        setProfile(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSaving(false);
        setIsEditing(false);
        // TODO: Implement actual API call to save profile
        console.log('Saving profile:', profile);
    };

    const handleCancel = () => {
        setIsEditing(false);
        // Reset to original values if needed
    };

    const handleLinkTelegram = () => {
        setShowTelegramModal(true);
    };

    const handleTelegramConnect = () => {
        // TODO: Implement Telegram OAuth or bot linking
        setProfile(prev => ({ ...prev, telegramLinked: true, telegramUsername: '@johndoe' }));
        setShowTelegramModal(false);
    };

    const handleUnlinkTelegram = () => {
        setProfile(prev => ({ ...prev, telegramLinked: false, telegramUsername: '' }));
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0a1628', color: '#e2e8f0', fontFamily: 'Inter, system-ui, sans-serif' }}>
            <Header userEmail={profile.email} />
            
            <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px' }}>
                {/* Page Header */}
                <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '32px' }}>⚙️</span>
                        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#fff', margin: 0 }}>Settings</h1>
                    </div>
                    <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>
                        Manage your account settings and preferences
                    </p>
                </div>

                {/* User Profile Section */}
                <div style={{
                    backgroundColor: '#0d1f3c',
                    borderRadius: '16px',
                    border: '1px solid #1e3a5f',
                    padding: '32px',
                    marginBottom: '24px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#fff', margin: 0, marginBottom: '4px' }}>
                                User Profile
                            </h2>
                            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                                Update your personal information
                            </p>
                        </div>
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    backgroundColor: '#3b82f6',
                                    color: '#fff',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                ✏️ Edit Profile
                            </button>
                        ) : (
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={handleCancel}
                                    style={{
                                        padding: '10px 20px',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        backgroundColor: '#1e3a5f',
                                        color: '#94a3b8',
                                        border: '1px solid #3f4f66',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    style={{
                                        padding: '10px 20px',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        backgroundColor: '#22c55e',
                                        color: '#000',
                                        border: 'none',
                                        cursor: isSaving ? 'not-allowed' : 'pointer',
                                        opacity: isSaving ? 0.6 : 1
                                    }}
                                >
                                    {isSaving ? '💾 Saving...' : '✓ Save Changes'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Profile Form */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* Name Field */}
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#94a3b8', marginBottom: '8px' }}>
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={profile.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                disabled={!isEditing}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    backgroundColor: isEditing ? '#1e3a5f' : '#0a1628',
                                    border: '1px solid #3f4f66',
                                    color: '#fff',
                                    outline: 'none',
                                    cursor: isEditing ? 'text' : 'not-allowed'
                                }}
                            />
                        </div>

                        {/* Email Field */}
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#94a3b8', marginBottom: '8px' }}>
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={profile.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                disabled={!isEditing}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    backgroundColor: isEditing ? '#1e3a5f' : '#0a1628',
                                    border: '1px solid #3f4f66',
                                    color: '#fff',
                                    outline: 'none',
                                    cursor: isEditing ? 'text' : 'not-allowed'
                                }}
                            />
                        </div>

                        {/* Mobile Number Field */}
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#94a3b8', marginBottom: '8px' }}>
                                Mobile Number
                            </label>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <select
                                    value={profile.countryCode}
                                    onChange={(e) => handleInputChange('countryCode', e.target.value)}
                                    disabled={!isEditing}
                                    style={{
                                        padding: '12px 16px',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        backgroundColor: isEditing ? '#1e3a5f' : '#0a1628',
                                        border: '1px solid #3f4f66',
                                        color: '#fff',
                                        outline: 'none',
                                        cursor: isEditing ? 'pointer' : 'not-allowed',
                                        minWidth: '140px'
                                    }}
                                >
                                    {countryCodes.map(({ code, country }) => (
                                        <option key={code} value={code}>
                                            {code} ({country})
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="tel"
                                    value={profile.mobileNumber}
                                    onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                                    disabled={!isEditing}
                                    placeholder="Enter mobile number"
                                    style={{
                                        flex: 1,
                                        padding: '12px 16px',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        backgroundColor: isEditing ? '#1e3a5f' : '#0a1628',
                                        border: '1px solid #3f4f66',
                                        color: '#fff',
                                        outline: 'none',
                                        cursor: isEditing ? 'text' : 'not-allowed'
                                    }}
                                />
                            </div>
                            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', marginBottom: 0 }}>
                                Used for SMS notifications and two-factor authentication
                            </p>
                        </div>
                    </div>
                </div>

                {/* Telegram Integration Section */}
                <div style={{
                    backgroundColor: '#0d1f3c',
                    borderRadius: '16px',
                    border: '1px solid #1e3a5f',
                    padding: '32px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <span style={{ fontSize: '24px' }}>📱</span>
                                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#fff', margin: 0 }}>
                                    Telegram Integration
                                </h2>
                            </div>
                            <p style={{ fontSize: '13px', color: '#64748b', margin: 0, marginBottom: '12px' }}>
                                Connect your Telegram account to receive instant trading alerts and morning briefs
                            </p>
                            {profile.telegramLinked && (
                                <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    backgroundColor: '#22c55e22',
                                    border: '1px solid #22c55e33'
                                }}>
                                    <span style={{ fontSize: '16px' }}>✓</span>
                                    <span style={{ fontSize: '13px', color: '#22c55e', fontWeight: '600' }}>
                                        Connected as {profile.telegramUsername}
                                    </span>
                                </div>
                            )}
                        </div>
                        {!profile.telegramLinked ? (
                            <button
                                onClick={handleLinkTelegram}
                                style={{
                                    padding: '12px 24px',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    background: 'linear-gradient(135deg, #0088cc 0%, #0066aa 100%)',
                                    color: '#fff',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <span style={{ fontSize: '18px' }}>📱</span>
                                Link Telegram
                            </button>
                        ) : (
                            <button
                                onClick={handleUnlinkTelegram}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    backgroundColor: '#ef444422',
                                    color: '#ef4444',
                                    border: '1px solid #ef444433',
                                    cursor: 'pointer'
                                }}
                            >
                                Unlink
                            </button>
                        )}
                    </div>

                    {/* Benefits List */}
                    <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #1e3a5f' }}>
                        <p style={{ fontSize: '13px', fontWeight: '600', color: '#94a3b8', marginBottom: '12px' }}>
                            Benefits of linking Telegram:
                        </p>
                        <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li style={{ fontSize: '13px', color: '#e2e8f0' }}>
                                Receive morning briefs directly in Telegram
                            </li>
                            <li style={{ fontSize: '13px', color: '#e2e8f0' }}>
                                Get instant price alerts and trade notifications
                            </li>
                            <li style={{ fontSize: '13px', color: '#e2e8f0' }}>
                                Execute trades via Telegram bot commands
                            </li>
                            <li style={{ fontSize: '13px', color: '#e2e8f0' }}>
                                Access portfolio summary on-the-go
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Telegram Link Modal */}
                {showTelegramModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2000,
                        padding: '20px'
                    }}>
                        <div style={{
                            backgroundColor: '#0d1f3c',
                            borderRadius: '16px',
                            border: '1px solid #1e3a5f',
                            width: '100%',
                            maxWidth: '500px',
                            padding: '32px'
                        }}>
                            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📱</div>
                                <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>
                                    Link Telegram Account
                                </h3>
                                <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>
                                    Follow these steps to connect your Telegram
                                </p>
                            </div>

                            <div style={{
                                backgroundColor: '#0a1628',
                                borderRadius: '12px',
                                padding: '20px',
                                marginBottom: '24px'
                            }}>
                                <ol style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <li style={{ fontSize: '14px', color: '#e2e8f0' }}>
                                        Open Telegram and search for <strong style={{ color: '#00d4ff' }}>@DecyphersBot</strong>
                                    </li>
                                    <li style={{ fontSize: '14px', color: '#e2e8f0' }}>
                                        Start a chat and send <strong style={{ color: '#00d4ff' }}>/start</strong>
                                    </li>
                                    <li style={{ fontSize: '14px', color: '#e2e8f0' }}>
                                        Send your verification code: <strong style={{ color: '#f59e0b' }}>ABC-123-XYZ</strong>
                                    </li>
                                    <li style={{ fontSize: '14px', color: '#e2e8f0' }}>
                                        Click "Connect" below once verified
                                    </li>
                                </ol>
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => setShowTelegramModal(false)}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        backgroundColor: '#1e3a5f',
                                        color: '#94a3b8',
                                        border: '1px solid #3f4f66',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleTelegramConnect}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        background: 'linear-gradient(135deg, #0088cc 0%, #0066aa 100%)',
                                        color: '#fff',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ✓ Connect
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
