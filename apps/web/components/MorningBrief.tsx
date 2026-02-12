'use client';

import React, { useState, useEffect } from 'react';

interface MarketSentiment {
    overall: 'bullish' | 'bearish' | 'neutral';
    confidence: number;
    reasoning: string;
}

interface WatchlistAlert {
    symbol: string;
    name: string;
    alertType: 'support' | 'resistance' | 'breakout' | 'breakdown';
    price: number;
    level: number;
}

interface IVAlert {
    sector: string;
    change: 'expanding' | 'contracting';
    percentage: number;
}

interface TradeCandidate {
    symbol: string;
    name: string;
    direction: 'long' | 'short';
    entry: number;
    target: number;
    stop: number;
    riskReward: number;
    reasoning: string;
    confidence: number;
}

interface MorningBriefData {
    date: string;
    marketSentiment: MarketSentiment;
    watchlistAlerts: WatchlistAlert[];
    ivAlerts: IVAlert[];
    tradeCandidates: TradeCandidate[];
    generatedAt: string;
}

interface MorningBriefProps {
    onScheduleChange?: (enabled: boolean, time: string) => void;
}

export const MorningBrief: React.FC<MorningBriefProps> = ({ onScheduleChange }) => {
    const [briefData, setBriefData] = useState<MorningBriefData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [scheduleEnabled, setScheduleEnabled] = useState(false);
    const [scheduleTime, setScheduleTime] = useState('08:30');
    const [showSettings, setShowSettings] = useState(false);

    // Mock data generator - replace with actual API call
    const generateMockBrief = (): MorningBriefData => {
        return {
            date: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
            marketSentiment: {
                overall: 'neutral',
                confidence: 72,
                reasoning: 'Mixed signals from major indices. S&P 500 consolidating near resistance while tech shows relative strength.'
            },
            watchlistAlerts: [
                { symbol: 'AAPL', name: 'Apple Inc', alertType: 'support', price: 185.20, level: 185.00 },
                { symbol: 'TSLA', name: 'Tesla Inc', alertType: 'resistance', price: 438.50, level: 440.00 },
                { symbol: 'NVDA', name: 'NVIDIA Corp', alertType: 'breakout', price: 875.50, level: 870.00 }
            ],
            ivAlerts: [
                { sector: 'Technology', change: 'expanding', percentage: 12.5 },
                { sector: 'Energy', change: 'contracting', percentage: -8.3 }
            ],
            tradeCandidates: [
                {
                    symbol: 'MSFT',
                    name: 'Microsoft',
                    direction: 'long',
                    entry: 420.50,
                    target: 435.00,
                    stop: 415.00,
                    riskReward: 2.64,
                    reasoning: 'Bullish divergence on RSI, consolidation near support, strong volume profile',
                    confidence: 78
                },
                {
                    symbol: 'META',
                    name: 'Meta Platforms',
                    direction: 'long',
                    entry: 512.30,
                    target: 530.00,
                    stop: 505.00,
                    riskReward: 2.42,
                    reasoning: 'Breaking above 20-day MA with increasing volume, sector rotation into tech',
                    confidence: 71
                }
            ],
            generatedAt: new Date().toISOString()
        };
    };

    const generateBrief = async () => {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setBriefData(generateMockBrief());
        setIsLoading(false);
    };

    const handleScheduleToggle = (enabled: boolean) => {
        setScheduleEnabled(enabled);
        if (onScheduleChange) {
            onScheduleChange(enabled, scheduleTime);
        }
    };

    const handleTimeChange = (time: string) => {
        setScheduleTime(time);
        if (scheduleEnabled && onScheduleChange) {
            onScheduleChange(true, time);
        }
    };

    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case 'bullish': return '#22c55e';
            case 'bearish': return '#ef4444';
            default: return '#f59e0b';
        }
    };

    const getSentimentIcon = (sentiment: string) => {
        switch (sentiment) {
            case 'bullish': return '📈';
            case 'bearish': return '📉';
            default: return '➡️';
        }
    };

    return (
        <div style={{
            backgroundColor: '#0d1f3c',
            borderRadius: '16px',
            border: '1px solid #1e3a5f',
            padding: '24px',
            maxWidth: '1200px',
            margin: '0 auto'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '32px' }}>☀️</span>
                        <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#fff', margin: 0 }}>The Morning Brief</h2>
                    </div>
                    <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>
                        Your daily market intelligence summary
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            backgroundColor: '#1e3a5f',
                            color: '#fff',
                            border: '1px solid #3f4f66',
                            cursor: 'pointer'
                        }}
                    >
                        ⚙️ Settings
                    </button>
                    <button
                        onClick={generateBrief}
                        disabled={isLoading}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            color: '#000',
                            border: 'none',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            opacity: isLoading ? 0.6 : 1
                        }}
                    >
                        {isLoading ? '⏳ Generating...' : '🔄 Generate Brief'}
                    </button>
                </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div style={{
                    backgroundColor: '#0a1628',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '24px',
                    border: '1px solid #1e3a5f'
                }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>
                        📅 Schedule Settings
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <input
                                type="checkbox"
                                checked={scheduleEnabled}
                                onChange={(e) => handleScheduleToggle(e.target.checked)}
                                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                            />
                            <label style={{ fontSize: '14px', color: '#e2e8f0' }}>
                                Enable daily morning brief delivery
                            </label>
                        </div>
                        {scheduleEnabled && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '32px' }}>
                                <label style={{ fontSize: '14px', color: '#94a3b8' }}>Delivery time:</label>
                                <input
                                    type="time"
                                    value={scheduleTime}
                                    onChange={(e) => handleTimeChange(e.target.value)}
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: '6px',
                                        backgroundColor: '#1e3a5f',
                                        border: '1px solid #3f4f66',
                                        color: '#fff',
                                        fontSize: '14px'
                                    }}
                                />
                                <span style={{ fontSize: '12px', color: '#64748b' }}>
                                    (Brief will be generated and sent to your phone)
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Brief Content */}
            {!briefData && !isLoading && (
                <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    color: '#64748b'
                }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.5 }}>☀️</div>
                    <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>No brief generated yet</div>
                    <div style={{ fontSize: '14px' }}>Click "Generate Brief" to create your morning market summary</div>
                </div>
            )}

            {isLoading && (
                <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    color: '#94a3b8'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'pulse 2s infinite' }}>⏳</div>
                    <div style={{ fontSize: '16px', fontWeight: '600' }}>Analyzing markets and generating your brief...</div>
                </div>
            )}

            {briefData && !isLoading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Date & Time */}
                    <div style={{
                        fontSize: '13px',
                        color: '#64748b',
                        textAlign: 'center',
                        paddingBottom: '16px',
                        borderBottom: '1px solid #1e3a5f'
                    }}>
                        {briefData.date} • Generated at {new Date(briefData.generatedAt).toLocaleTimeString()}
                    </div>

                    {/* Market Sentiment */}
                    <div style={{
                        backgroundColor: '#0a1628',
                        borderRadius: '12px',
                        padding: '20px',
                        border: '1px solid #1e3a5f'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <span style={{ fontSize: '24px' }}>{getSentimentIcon(briefData.marketSentiment.overall)}</span>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#fff', margin: 0 }}>Market Sentiment</h3>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                            <span style={{
                                padding: '6px 16px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                backgroundColor: getSentimentColor(briefData.marketSentiment.overall) + '22',
                                color: getSentimentColor(briefData.marketSentiment.overall)
                            }}>
                                {briefData.marketSentiment.overall}
                            </span>
                            <span style={{ fontSize: '14px', color: '#94a3b8' }}>
                                Confidence: <span style={{ color: '#fff', fontWeight: '600' }}>{briefData.marketSentiment.confidence}%</span>
                            </span>
                        </div>
                        <p style={{ fontSize: '14px', color: '#e2e8f0', lineHeight: '1.6', margin: 0 }}>
                            {briefData.marketSentiment.reasoning}
                        </p>
                    </div>

                    {/* Watchlist Alerts */}
                    {briefData.watchlistAlerts.length > 0 && (
                        <div style={{
                            backgroundColor: '#0a1628',
                            borderRadius: '12px',
                            padding: '20px',
                            border: '1px solid #1e3a5f'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <span style={{ fontSize: '24px' }}>🎯</span>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#fff', margin: 0 }}>
                                    Watchlist Alerts ({briefData.watchlistAlerts.length})
                                </h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {briefData.watchlistAlerts.map((alert, idx) => (
                                    <div key={idx} style={{
                                        padding: '12px',
                                        backgroundColor: '#1e3a5f33',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>{alert.symbol}</div>
                                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>{alert.name}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                textTransform: 'uppercase',
                                                color: alert.alertType === 'support' ? '#22c55e' : alert.alertType === 'resistance' ? '#ef4444' : '#f59e0b',
                                                marginBottom: '4px'
                                            }}>
                                                {alert.alertType}
                                            </div>
                                            <div style={{ fontSize: '13px', color: '#e2e8f0' }}>
                                                ${alert.price.toFixed(2)} → ${alert.level.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* IV Alerts */}
                    {briefData.ivAlerts.length > 0 && (
                        <div style={{
                            backgroundColor: '#0a1628',
                            borderRadius: '12px',
                            padding: '20px',
                            border: '1px solid #1e3a5f'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <span style={{ fontSize: '24px' }}>📊</span>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#fff', margin: 0 }}>
                                    Implied Volatility Changes
                                </h3>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                {briefData.ivAlerts.map((alert, idx) => (
                                    <div key={idx} style={{
                                        padding: '12px 16px',
                                        backgroundColor: '#1e3a5f33',
                                        borderRadius: '8px',
                                        flex: '1 1 200px'
                                    }}>
                                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '4px' }}>
                                            {alert.sector}
                                        </div>
                                        <div style={{
                                            fontSize: '13px',
                                            color: alert.change === 'expanding' ? '#f59e0b' : '#22c55e'
                                        }}>
                                            {alert.change === 'expanding' ? '↑' : '↓'} {Math.abs(alert.percentage)}% {alert.change}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Trade Candidates */}
                    {briefData.tradeCandidates.length > 0 && (
                        <div style={{
                            backgroundColor: '#0a1628',
                            borderRadius: '12px',
                            padding: '20px',
                            border: '1px solid #1e3a5f'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <span style={{ fontSize: '24px' }}>💡</span>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#fff', margin: 0 }}>
                                    Top Trade Candidates
                                </h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {briefData.tradeCandidates.map((trade, idx) => (
                                    <div key={idx} style={{
                                        padding: '16px',
                                        backgroundColor: '#1e3a5f33',
                                        borderRadius: '12px',
                                        border: '1px solid #3f4f66'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                    <span style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>{trade.symbol}</span>
                                                    <span style={{
                                                        padding: '2px 8px',
                                                        borderRadius: '4px',
                                                        fontSize: '11px',
                                                        fontWeight: '600',
                                                        textTransform: 'uppercase',
                                                        backgroundColor: trade.direction === 'long' ? '#22c55e22' : '#ef444422',
                                                        color: trade.direction === 'long' ? '#22c55e' : '#ef4444'
                                                    }}>
                                                        {trade.direction}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '13px', color: '#94a3b8' }}>{trade.name}</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>Confidence</div>
                                                <div style={{ fontSize: '16px', fontWeight: '700', color: '#f59e0b' }}>{trade.confidence}%</div>
                                            </div>
                                        </div>
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(4, 1fr)',
                                            gap: '12px',
                                            marginBottom: '12px',
                                            padding: '12px',
                                            backgroundColor: '#0a162833',
                                            borderRadius: '8px'
                                        }}>
                                            <div>
                                                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Entry</div>
                                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>${trade.entry.toFixed(2)}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Target</div>
                                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#22c55e' }}>${trade.target.toFixed(2)}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Stop</div>
                                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#ef4444' }}>${trade.stop.toFixed(2)}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>R:R</div>
                                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#f59e0b' }}>{trade.riskReward.toFixed(2)}:1</div>
                                            </div>
                                        </div>
                                        <div style={{
                                            fontSize: '13px',
                                            color: '#e2e8f0',
                                            lineHeight: '1.5',
                                            padding: '8px',
                                            backgroundColor: '#0a162833',
                                            borderRadius: '6px',
                                            borderLeft: '3px solid #f59e0b'
                                        }}>
                                            {trade.reasoning}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    );
};
