'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { getCryptoPrices, getStockPrices, getForexPrices, getCommodityPrices, PriceData } from '@/lib/priceService';
import { searchAssets, AssetInfo } from '@/lib/assetLibrary';

interface WatchlistItem {
    symbol: string;
    name: string;
    assetClass: string;
    price: number;
    change24h: number;
    priceHistory: number[];
    sentiment: 'bullish' | 'bearish' | 'ranging';
    volume?: string;
}

// Expanded default watchlist with popular assets
const defaultWatchlist: { symbol: string; name: string; assetClass: string }[] = [
    // Crypto - Top coins
    { symbol: 'BTCUSD', name: 'Bitcoin', assetClass: 'crypto' },
    { symbol: 'ETHUSDT', name: 'Ethereum', assetClass: 'crypto' },
    { symbol: 'SOLUSD', name: 'Solana', assetClass: 'crypto' },
    { symbol: 'BNBUSD', name: 'BNB', assetClass: 'crypto' },
    // US Stocks - Mega caps
    { symbol: 'AAPL', name: 'Apple Inc', assetClass: 'stock' },
    { symbol: 'MSFT', name: 'Microsoft', assetClass: 'stock' },
    { symbol: 'GOOGL', name: 'Alphabet', assetClass: 'stock' },
    { symbol: 'AMZN', name: 'Amazon', assetClass: 'stock' },
    { symbol: 'NVDA', name: 'NVIDIA', assetClass: 'stock' },
    { symbol: 'TSLA', name: 'Tesla', assetClass: 'stock' },
    { symbol: 'META', name: 'Meta Platforms', assetClass: 'stock' },
    // Forex - Major pairs
    { symbol: 'EURUSD', name: 'EUR/USD', assetClass: 'forex' },
    { symbol: 'GBPUSD', name: 'GBP/USD', assetClass: 'forex' },
    { symbol: 'USDJPY', name: 'USD/JPY', assetClass: 'forex' },
    // Commodities
    { symbol: 'XAUUSD', name: 'Gold', assetClass: 'commodity' },
    { symbol: 'XAGUSD', name: 'Silver', assetClass: 'commodity' },
    // ETFs
    { symbol: 'SPY', name: 'S&P 500 ETF', assetClass: 'etf' },
    { symbol: 'QQQ', name: 'Nasdaq 100 ETF', assetClass: 'etf' },
];

// AI Sentiment based on price movement and volatility
const calculateSentiment = (change: number, priceHistory: number[]): 'bullish' | 'bearish' | 'ranging' => {
    if (priceHistory.length < 2) return 'ranging';

    // Calculate trend strength
    const recentChange = change;
    const volatility = Math.abs(priceHistory[priceHistory.length - 1] - priceHistory[0]) / priceHistory[0] * 100;

    if (recentChange > 2 || (recentChange > 0.5 && volatility > 3)) return 'bullish';
    if (recentChange < -2 || (recentChange < -0.5 && volatility > 3)) return 'bearish';
    return 'ranging';
};

// Sentiment Badge Component
const SentimentBadge = ({ sentiment }: { sentiment: 'bullish' | 'bearish' | 'ranging' }) => {
    const config = {
        bullish: { label: 'BULLISH', icon: '↑', bg: '#22c55e22', color: '#22c55e', border: '#22c55e44' },
        bearish: { label: 'BEARISH', icon: '↓', bg: '#ef444422', color: '#ef4444', border: '#ef444444' },
        ranging: { label: 'RANGING', icon: '↔', bg: '#f59e0b22', color: '#f59e0b', border: '#f59e0b44' },
    };
    const c = config[sentiment];

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            borderRadius: '4px',
            backgroundColor: c.bg,
            border: `1px solid ${c.border}`,
            fontSize: '11px',
            fontWeight: '700',
            color: c.color,
            letterSpacing: '0.5px'
        }}>
            <span style={{ fontSize: '14px' }}>{c.icon}</span>
            {c.label}
        </div>
    );
};

// Enhanced Sparkline with gradient fill
const TradingViewSparkline = ({ data, color, width = 120, height = 45 }: { data: number[]; color: string; width?: number; height?: number }) => {
    if (!data || data.length < 2) return <div style={{ width, height, backgroundColor: '#131722', borderRadius: '4px' }} />;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const padding = 2;

    const points = data.map((val, i) => {
        const x = padding + (i / (data.length - 1)) * (width - padding * 2);
        const y = padding + (height - padding * 2) - ((val - min) / range) * (height - padding * 2);
        return `${x},${y}`;
    }).join(' ');

    const fillPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

    return (
        <svg width={width} height={height} style={{ display: 'block' }}>
            <defs>
                <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon
                points={fillPoints}
                fill={`url(#grad-${color.replace('#', '')})`}
            />
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

// Floating Price Ticker - TradingView style
const PriceTicker = ({ items }: { items: WatchlistItem[] }) => {
    const tickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ticker = tickerRef.current;
        if (!ticker || items.length === 0) return;

        let animationId: number;
        let position = 0;

        const animate = () => {
            position -= 0.8;
            if (position <= -ticker.scrollWidth / 2) {
                position = 0;
            }
            ticker.style.transform = `translateX(${position}px)`;
            animationId = requestAnimationFrame(animate);
        };

        animationId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationId);
    }, [items]);

    if (items.length === 0) return null;
    const tickerItems = [...items, ...items];

    return (
        <div style={{
            overflow: 'hidden',
            backgroundColor: '#131722',
            borderBottom: '1px solid #2a2e39',
            padding: '6px 0'
        }}>
            <div ref={tickerRef} style={{ display: 'flex', gap: '40px', whiteSpace: 'nowrap' }}>
                {tickerItems.map((item, idx) => (
                    <div key={`${item.symbol}-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontWeight: '600', color: '#d1d4dc', fontSize: '12px' }}>{item.symbol}</span>
                        <span style={{ color: '#fff', fontSize: '12px', fontWeight: '500' }}>
                            {item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span style={{
                            color: item.change24h >= 0 ? '#26a69a' : '#ef5350',
                            fontSize: '11px',
                            fontWeight: '600'
                        }}>
                            {item.change24h >= 0 ? '▲' : '▼'} {Math.abs(item.change24h).toFixed(2)}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// TradingView Style Watchlist Card
const WatchlistCard = ({ item, onRemove }: { item: WatchlistItem; onRemove: (symbol: string) => void }) => {
    const isPositive = item.change24h >= 0;
    const chartColor = isPositive ? '#26a69a' : '#ef5350';

    return (
        <div style={{
            backgroundColor: '#1e222d',
            borderRadius: '8px',
            padding: '16px',
            border: '1px solid #2a2e39',
            position: 'relative',
            transition: 'all 0.15s ease',
            cursor: 'pointer'
        }}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#252a37';
                e.currentTarget.style.borderColor = '#3b4252';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1e222d';
                e.currentTarget.style.borderColor = '#2a2e39';
            }}
        >
            {/* Remove button */}
            <button
                onClick={(e) => { e.stopPropagation(); onRemove(item.symbol); }}
                style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '22px',
                    height: '22px',
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#666',
                    cursor: 'pointer',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#ef535022'; e.currentTarget.style.color = '#ef5350'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#666'; }}
            >
                ×
            </button>

            {/* Header: Symbol & Asset Class */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#d1d4dc', letterSpacing: '0.3px' }}>{item.symbol}</div>
                    <div style={{ fontSize: '11px', color: '#787b86', marginTop: '2px' }}>{item.name}</div>
                </div>
                <span style={{
                    padding: '2px 6px',
                    borderRadius: '3px',
                    fontSize: '9px',
                    fontWeight: '600',
                    backgroundColor: '#2962ff22',
                    color: '#2962ff',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                }}>
                    {item.assetClass}
                </span>
            </div>

            {/* Price & Change */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '8px' }}>
                <div style={{ fontSize: '22px', fontWeight: '700', color: '#fff', fontFamily: 'monospace' }}>
                    {item.price < 10
                        ? item.price.toFixed(4)
                        : item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: isPositive ? '#26a69a' : '#ef5350',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px'
                }}>
                    {isPositive ? '▲' : '▼'} {Math.abs(item.change24h).toFixed(2)}%
                </div>
            </div>

            {/* AI Sentiment Badge */}
            <div style={{ marginBottom: '12px' }}>
                <SentimentBadge sentiment={item.sentiment} />
            </div>

            {/* Sparkline Chart */}
            <TradingViewSparkline
                data={item.priceHistory}
                color={chartColor}
                width={160}
                height={50}
            />
        </div>
    );
};

export default function WatchlistPage() {
    const { user } = useAuth();
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<AssetInfo[]>([]);
    const [savedSymbols, setSavedSymbols] = useState<{ symbol: string; name: string; assetClass: string }[]>([]);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

    // Load saved watchlist from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('watchlist_v2');
        if (saved) {
            setSavedSymbols(JSON.parse(saved));
        } else {
            setSavedSymbols(defaultWatchlist);
            localStorage.setItem('watchlist_v2', JSON.stringify(defaultWatchlist));
        }
    }, []);

    // Generate realistic price history
    const generatePriceHistory = (basePrice: number, change: number) => {
        const history: number[] = [];
        let price = basePrice * (1 - change / 100 * 1.2);
        const volatility = basePrice * 0.008;

        for (let i = 0; i < 30; i++) {
            const trend = (change / 100) * (i / 30) * basePrice * 0.3;
            price += trend + (Math.random() - 0.48) * volatility;
            history.push(Math.max(price, basePrice * 0.8));
        }
        history.push(basePrice);
        return history;
    };

    // Fetch prices for watchlist
    const fetchPrices = useCallback(async () => {
        if (savedSymbols.length === 0) return;

        try {
            const cryptoSymbols = savedSymbols.filter(s => s.assetClass === 'crypto').map(s => s.symbol);
            const stockSymbols = savedSymbols.filter(s => ['stock', 'etf'].includes(s.assetClass)).map(s => s.symbol);
            const forexSymbols = savedSymbols.filter(s => s.assetClass === 'forex').map(s => s.symbol);
            const commoditySymbols = savedSymbols.filter(s => s.assetClass === 'commodity').map(s => s.symbol);

            const [cryptoPrices, stockPrices, forexPrices, commodityPrices] = await Promise.all([
                cryptoSymbols.length > 0 ? getCryptoPrices(cryptoSymbols) : Promise.resolve({} as Record<string, PriceData>),
                stockSymbols.length > 0 ? getStockPrices(stockSymbols) : Promise.resolve({} as Record<string, PriceData>),
                forexSymbols.length > 0 ? getForexPrices(forexSymbols) : Promise.resolve({} as Record<string, PriceData>),
                commoditySymbols.length > 0 ? getCommodityPrices(commoditySymbols) : Promise.resolve({} as Record<string, PriceData>),
            ]);

            const allPrices: Record<string, PriceData> = { ...cryptoPrices, ...stockPrices, ...forexPrices, ...commodityPrices };

            const items: WatchlistItem[] = savedSymbols.map(s => {
                const priceData = allPrices[s.symbol];
                const price = priceData?.price || getFallbackPrice(s.symbol);
                const change = priceData?.change24h || (Math.random() * 8 - 4);
                const priceHistory = generatePriceHistory(price, change);

                return {
                    symbol: s.symbol,
                    name: s.name,
                    assetClass: s.assetClass,
                    price,
                    change24h: change,
                    priceHistory,
                    sentiment: calculateSentiment(change, priceHistory)
                };
            });

            setWatchlist(items);
            setLastUpdate(new Date());
        } catch (error) {
            console.error('Failed to fetch prices:', error);
        } finally {
            setIsLoading(false);
        }
    }, [savedSymbols]);

    useEffect(() => {
        if (savedSymbols.length > 0) {
            fetchPrices();
            const interval = setInterval(fetchPrices, 15000); // Refresh every 15s
            return () => clearInterval(interval);
        }
    }, [savedSymbols, fetchPrices]);

    // Search assets
    useEffect(() => {
        if (searchQuery.length >= 1) {
            const results = searchAssets(searchQuery);
            setSearchResults(results.slice(0, 12));
        } else {
            setSearchResults([]);
        }
    }, [searchQuery]);

    const addToWatchlist = (asset: AssetInfo) => {
        const exists = savedSymbols.some(s => s.symbol === asset.symbol);
        if (!exists) {
            const newSymbols = [...savedSymbols, { symbol: asset.symbol, name: asset.name, assetClass: asset.assetClass }];
            setSavedSymbols(newSymbols);
            localStorage.setItem('watchlist_v2', JSON.stringify(newSymbols));
        }
        setShowAddModal(false);
        setSearchQuery('');
    };

    const removeFromWatchlist = (symbol: string) => {
        const newSymbols = savedSymbols.filter(s => s.symbol !== symbol);
        setSavedSymbols(newSymbols);
        localStorage.setItem('watchlist_v2', JSON.stringify(newSymbols));
        setWatchlist(watchlist.filter(w => w.symbol !== symbol));
    };

    if (isLoading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#131722' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', marginBottom: '16px' }}>📊</div>
                    <div style={{ fontSize: '16px', color: '#d1d4dc' }}>Loading market data...</div>
                </div>
            </div>
        );
    }

    const displayUser = user || { email: 'trader@demo.com' };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#131722', color: '#d1d4dc' }}>
            {/* Header - TradingView style */}
            <header style={{ backgroundColor: '#1e222d', borderBottom: '1px solid #2a2e39' }}>
                <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                        <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#2962ff' }}>
                            TradingPlatform
                        </h1>
                        <nav style={{ display: 'flex', gap: '24px' }}>
                            <Link href="/portfolio" style={{ color: '#787b86', textDecoration: 'none', fontSize: '13px', fontWeight: '500' }}>Portfolio</Link>
                            <Link href="/watchlist" style={{ color: '#2962ff', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>Watchlist</Link>
                            <Link href="/dashboard" style={{ color: '#787b86', textDecoration: 'none', fontSize: '13px', fontWeight: '500' }}>Dashboard</Link>
                        </nav>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {lastUpdate && (
                            <span style={{ fontSize: '11px', color: '#787b86' }}>
                                Updated {lastUpdate.toLocaleTimeString()}
                            </span>
                        )}
                        <span style={{ color: '#787b86', fontSize: '12px' }}>{displayUser.email}</span>
                    </div>
                </div>
            </header>

            {/* Floating Price Ticker */}
            <PriceTicker items={watchlist} />

            {/* Main Content */}
            <main style={{ maxWidth: '1600px', margin: '0 auto', padding: '24px' }}>
                {/* Title & Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>Watchlist</h2>
                        <p style={{ color: '#787b86', fontSize: '13px' }}>
                            {watchlist.length} assets • Live prices • AI sentiment analysis
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: '#2962ff',
                            color: '#fff',
                            fontWeight: '600',
                            fontSize: '13px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'background-color 0.15s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e53e4'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2962ff'}
                    >
                        + Add Symbol
                    </button>
                </div>

                {/* Watchlist Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                    {watchlist.map(item => (
                        <WatchlistCard key={item.symbol} item={item} onRemove={removeFromWatchlist} />
                    ))}
                </div>

                {watchlist.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '80px 20px', color: '#787b86' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                        <p style={{ fontSize: '16px', marginBottom: '16px' }}>Your watchlist is empty</p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            style={{ padding: '12px 24px', borderRadius: '6px', border: '1px solid #2962ff', backgroundColor: 'transparent', color: '#2962ff', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
                        >
                            Add your first symbol
                        </button>
                    </div>
                )}
            </main>

            {/* Add Symbol Modal */}
            {showAddModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: '#1e222d',
                        borderRadius: '12px',
                        padding: '24px',
                        width: '450px',
                        maxHeight: '550px',
                        border: '1px solid #2a2e39'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>Add to Watchlist</h3>
                            <button onClick={() => setShowAddModal(false)} style={{ border: 'none', background: 'none', color: '#787b86', fontSize: '24px', cursor: 'pointer' }}>×</button>
                        </div>

                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search symbol or name..."
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                borderRadius: '8px',
                                border: '1px solid #2a2e39',
                                backgroundColor: '#131722',
                                color: '#fff',
                                fontSize: '14px',
                                marginBottom: '16px',
                                outline: 'none'
                            }}
                            autoFocus
                        />

                        <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                            {searchResults.map(asset => (
                                <div
                                    key={asset.symbol}
                                    onClick={() => addToWatchlist(asset)}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '14px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        marginBottom: '6px',
                                        backgroundColor: '#252a37',
                                        transition: 'background-color 0.15s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a2e39'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#252a37'}
                                >
                                    <div>
                                        <div style={{ fontWeight: '600', color: '#fff', fontSize: '14px' }}>{asset.symbol}</div>
                                        <div style={{ fontSize: '12px', color: '#787b86' }}>{asset.name}</div>
                                    </div>
                                    <span style={{
                                        padding: '3px 8px',
                                        borderRadius: '4px',
                                        fontSize: '10px',
                                        fontWeight: '600',
                                        backgroundColor: '#2962ff22',
                                        color: '#2962ff',
                                        textTransform: 'uppercase'
                                    }}>
                                        {asset.assetClass}
                                    </span>
                                </div>
                            ))}
                            {searchQuery.length >= 1 && searchResults.length === 0 && (
                                <p style={{ textAlign: 'center', color: '#787b86', padding: '24px' }}>No results found</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Fallback prices for demo when API unavailable
function getFallbackPrice(symbol: string): number {
    const fallbacks: Record<string, number> = {
        'BTCUSD': 97500, 'ETHUSDT': 3250, 'SOLUSD': 205, 'BNBUSD': 695,
        'AAPL': 238, 'MSFT': 435, 'GOOGL': 195, 'AMZN': 225, 'NVDA': 135, 'TSLA': 420, 'META': 610,
        'EURUSD': 1.0425, 'GBPUSD': 1.2180, 'USDJPY': 156.80,
        'XAUUSD': 2765, 'XAGUSD': 30.85,
        'SPY': 605, 'QQQ': 525
    };
    return fallbacks[symbol] || Math.random() * 500 + 50;
}
