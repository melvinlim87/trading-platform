'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
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
}

// Default watchlist
const defaultWatchlist: { symbol: string; name: string; assetClass: string }[] = [
    { symbol: 'BTCUSD', name: 'Bitcoin', assetClass: 'crypto' },
    { symbol: 'ETHUSDT', name: 'Ethereum', assetClass: 'crypto' },
    { symbol: 'AAPL', name: 'Apple Inc', assetClass: 'stock' },
    { symbol: 'TSLA', name: 'Tesla Inc', assetClass: 'stock' },
    { symbol: 'EURUSD', name: 'EUR/USD', assetClass: 'forex' },
    { symbol: 'XAUUSD', name: 'Gold', assetClass: 'commodity' },
    { symbol: 'SPY', name: 'S&P 500 ETF', assetClass: 'etf' },
    { symbol: 'NVDA', name: 'NVIDIA Corp', assetClass: 'stock' },
];

// Mini Sparkline Component
const MiniSparkline = ({ data, color, width = 80, height = 30 }: { data: number[]; color: string; width?: number; height?: number }) => {
    if (!data || data.length < 2) return <div style={{ width, height, backgroundColor: '#1e3a5f33', borderRadius: '4px' }} />;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={width} height={height} style={{ display: 'block' }}>
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

// Floating Price Ticker
const PriceTicker = ({ items }: { items: WatchlistItem[] }) => {
    const tickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ticker = tickerRef.current;
        if (!ticker) return;

        let animationId: number;
        let position = 0;

        const animate = () => {
            position -= 0.5;
            if (position <= -ticker.scrollWidth / 2) {
                position = 0;
            }
            ticker.style.transform = `translateX(${position}px)`;
            animationId = requestAnimationFrame(animate);
        };

        animationId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationId);
    }, [items]);

    const tickerItems = [...items, ...items]; // Duplicate for seamless loop

    return (
        <div style={{
            overflow: 'hidden',
            backgroundColor: '#0d1929',
            borderBottom: '1px solid #1e3a5f',
            padding: '8px 0'
        }}>
            <div ref={tickerRef} style={{ display: 'flex', gap: '32px', whiteSpace: 'nowrap' }}>
                {tickerItems.map((item, idx) => (
                    <div key={`${item.symbol}-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: '600', color: '#fff', fontSize: '13px' }}>{item.symbol}</span>
                        <span style={{ color: '#e2e8f0', fontSize: '13px' }}>${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <span style={{
                            color: item.change24h >= 0 ? '#22c55e' : '#ef4444',
                            fontSize: '12px',
                            fontWeight: '500'
                        }}>
                            {item.change24h >= 0 ? '+' : ''}{item.change24h.toFixed(2)}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Watchlist Card
const WatchlistCard = ({ item, onRemove }: { item: WatchlistItem; onRemove: (symbol: string) => void }) => {
    const isPositive = item.change24h >= 0;

    return (
        <div style={{
            backgroundColor: '#0f1a2e',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid #1e3a5f',
            position: 'relative',
            transition: 'all 0.2s',
            cursor: 'pointer'
        }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#1e3a5f'}
        >
            {/* Remove button */}
            <button
                onClick={(e) => { e.stopPropagation(); onRemove(item.symbol); }}
                style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: '#ef444433',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                ×
            </button>

            {/* Symbol & Name */}
            <div style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>{item.symbol}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{item.name}</div>
            </div>

            {/* Price */}
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
                ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>

            {/* Change */}
            <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: isPositive ? '#22c55e' : '#ef4444',
                marginBottom: '12px'
            }}>
                {isPositive ? '▲' : '▼'} {isPositive ? '+' : ''}{item.change24h.toFixed(2)}%
            </div>

            {/* Sparkline */}
            <MiniSparkline
                data={item.priceHistory}
                color={isPositive ? '#22c55e' : '#ef4444'}
                width={100}
                height={35}
            />
        </div>
    );
};

export default function WatchlistPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<AssetInfo[]>([]);
    const [savedSymbols, setSavedSymbols] = useState<{ symbol: string; name: string; assetClass: string }[]>([]);

    // Load saved watchlist from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('watchlist');
        if (saved) {
            setSavedSymbols(JSON.parse(saved));
        } else {
            setSavedSymbols(defaultWatchlist);
            localStorage.setItem('watchlist', JSON.stringify(defaultWatchlist));
        }
    }, []);

    // Generate mock price history
    const generatePriceHistory = (basePrice: number, change: number) => {
        const history = [];
        let price = basePrice * (1 - change / 100 * 1.5);
        for (let i = 0; i < 20; i++) {
            price += (Math.random() - 0.45) * (basePrice * 0.01);
            history.push(price);
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
                const price = priceData?.price || (Math.random() * 1000 + 50); // Fallback mock
                const change = priceData?.change24h || (Math.random() * 10 - 5);

                return {
                    symbol: s.symbol,
                    name: s.name,
                    assetClass: s.assetClass,
                    price,
                    change24h: change,
                    priceHistory: generatePriceHistory(price, change)
                };
            });

            setWatchlist(items);
        } catch (error) {
            console.error('Failed to fetch prices:', error);
        } finally {
            setIsLoading(false);
        }
    }, [savedSymbols]);

    useEffect(() => {
        if (savedSymbols.length > 0) {
            fetchPrices();
            const interval = setInterval(fetchPrices, 30000); // Refresh every 30s
            return () => clearInterval(interval);
        }
    }, [savedSymbols, fetchPrices]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login');
        }
    }, [user, authLoading, router]);

    // Search assets
    useEffect(() => {
        if (searchQuery.length >= 1) {
            const results = searchAssets(searchQuery);
            setSearchResults(results.slice(0, 10));
        } else {
            setSearchResults([]);
        }
    }, [searchQuery]);

    const addToWatchlist = (asset: AssetInfo) => {
        const exists = savedSymbols.some(s => s.symbol === asset.symbol);
        if (!exists) {
            const newSymbols = [...savedSymbols, { symbol: asset.symbol, name: asset.name, assetClass: asset.assetClass }];
            setSavedSymbols(newSymbols);
            localStorage.setItem('watchlist', JSON.stringify(newSymbols));
        }
        setShowAddModal(false);
        setSearchQuery('');
    };

    const removeFromWatchlist = (symbol: string) => {
        const newSymbols = savedSymbols.filter(s => s.symbol !== symbol);
        setSavedSymbols(newSymbols);
        localStorage.setItem('watchlist', JSON.stringify(newSymbols));
        setWatchlist(watchlist.filter(w => w.symbol !== symbol));
    };

    if (authLoading || isLoading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a1628' }}>
                <div style={{ fontSize: '24px', color: '#fff' }}>Loading watchlist...</div>
            </div>
        );
    }

    const displayUser = user || { email: 'demo@example.com' };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0a1628', color: '#e2e8f0' }}>
            {/* Header */}
            <header style={{ backgroundColor: '#0d1929', borderBottom: '1px solid #1e3a5f' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <h1 style={{ fontSize: '24px', fontWeight: '700', background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Trading Platform
                        </h1>
                        <nav style={{ display: 'flex', gap: '16px' }}>
                            <Link href="/portfolio" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px' }}>Portfolio</Link>
                            <Link href="/watchlist" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>Watchlist</Link>
                            <Link href="/dashboard" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px' }}>Dashboard</Link>
                        </nav>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ color: '#64748b', fontSize: '14px' }}>{displayUser.email}</span>
                    </div>
                </div>
            </header>

            {/* Floating Price Ticker */}
            <PriceTicker items={watchlist} />

            {/* Main Content */}
            <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
                {/* Title & Add Button */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>📊 My Watchlist</h2>
                        <p style={{ color: '#64748b', fontSize: '14px' }}>Track your favorite assets • Auto-refreshes every 30s</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: '#3b82f6',
                            color: '#fff',
                            fontWeight: '600',
                            fontSize: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        + Add Symbol
                    </button>
                </div>

                {/* Watchlist Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                    {watchlist.map(item => (
                        <WatchlistCard key={item.symbol} item={item} onRemove={removeFromWatchlist} />
                    ))}
                </div>

                {watchlist.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                        <p>No assets in your watchlist yet.</p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            style={{ marginTop: '16px', padding: '10px 20px', borderRadius: '8px', border: '1px solid #3b82f6', backgroundColor: 'transparent', color: '#3b82f6', cursor: 'pointer' }}
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
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: '#0f1a2e',
                        borderRadius: '16px',
                        padding: '24px',
                        width: '400px',
                        maxHeight: '500px',
                        border: '1px solid #1e3a5f'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>Add to Watchlist</h3>
                            <button onClick={() => setShowAddModal(false)} style={{ border: 'none', background: 'none', color: '#64748b', fontSize: '24px', cursor: 'pointer' }}>×</button>
                        </div>

                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by symbol or name..."
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                border: '1px solid #1e3a5f',
                                backgroundColor: '#0a1628',
                                color: '#fff',
                                fontSize: '14px',
                                marginBottom: '16px'
                            }}
                            autoFocus
                        />

                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {searchResults.map(asset => (
                                <div
                                    key={asset.symbol}
                                    onClick={() => addToWatchlist(asset)}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        marginBottom: '8px',
                                        backgroundColor: '#1e3a5f33'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e3a5f66'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1e3a5f33'}
                                >
                                    <div>
                                        <div style={{ fontWeight: '600', color: '#fff' }}>{asset.symbol}</div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>{asset.name}</div>
                                    </div>
                                    <span style={{
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        fontSize: '10px',
                                        fontWeight: '600',
                                        backgroundColor: '#3b82f622',
                                        color: '#3b82f6',
                                        textTransform: 'uppercase'
                                    }}>
                                        {asset.assetClass}
                                    </span>
                                </div>
                            ))}
                            {searchQuery.length >= 1 && searchResults.length === 0 && (
                                <p style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>No results found</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
