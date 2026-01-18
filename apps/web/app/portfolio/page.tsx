'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { accountsAPI, portfolioImportAPI } from '@/lib/api';
import { fetchAllPrices } from '@/lib/priceService';
import { classifySymbol, assetClassOptions, AssetClass } from '@/lib/symbolClassifier';
import Link from 'next/link';

interface Position {
    id: string;
    symbol: string;
    name: string;
    quantity: number;
    avgPrice: number;
    currentPrice: number;
    assetClass: string;
    positionType?: 'spot' | 'perpetual' | 'option' | 'long' | 'short';
    leverage?: number;
    margin?: number;
    expiry?: string;
    optionDetails?: string;
    broker?: string;
    platform?: string;
}

interface Account {
    id: string;
    type: string;
    currency: string;
    balance: number;
    positions: Position[];
}

// Extended mock positions with BALANCED notional values (~$15-20k each asset class for clear pie chart)
const mockPositions: Position[] = [
    // Cryptocurrency (~$20k notional)
    { id: '1', symbol: 'BTCUSD', name: 'Bitcoin', quantity: 0.25, avgPrice: 42500.00, currentPrice: 68000.00, assetClass: 'crypto', positionType: 'long', broker: 'Binance', platform: 'Binance App' },
    { id: '2', symbol: 'ETHUSDT', name: 'Ethereum', quantity: 1.5, avgPrice: 2200.00, currentPrice: 3500.00, assetClass: 'crypto', positionType: 'long', broker: 'Coinbase', platform: 'Coinbase Pro' },
    // Forex (~$18k notional)
    { id: '3', symbol: 'EURUSD', name: 'Euro / US Dollar', quantity: 15000, avgPrice: 1.09, currentPrice: 1.10, assetClass: 'forex', positionType: 'long', broker: 'OANDA', platform: 'MT5' },
    { id: '9', symbol: 'GBPJPY', name: 'GBP/JPY', quantity: 100, avgPrice: 185.50, currentPrice: 188.20, assetClass: 'forex', positionType: 'long', broker: 'IG', platform: 'MT4' },
    // Stocks (~$20k notional)
    { id: '4', symbol: 'TSLA', name: 'Tesla Inc', quantity: 15, avgPrice: 250.00, currentPrice: 438.50, assetClass: 'stock', positionType: 'long', broker: 'IBKR', platform: 'TWS' },
    { id: '5', symbol: 'AAPL', name: 'Apple Inc', quantity: 40, avgPrice: 150.00, currentPrice: 185.20, assetClass: 'stock', positionType: 'long', broker: 'Fidelity', platform: 'Web' },
    { id: '10', symbol: 'NVDA', name: 'NVIDIA Corp', quantity: 8, avgPrice: 450.00, currentPrice: 875.50, assetClass: 'stock', positionType: 'long', broker: 'TD Ameritrade', platform: 'thinkorSwim' },
    // Unit Trusts (~$18k notional)
    { id: '6', symbol: 'VWRA', name: 'Vanguard FTSE All-World', quantity: 90, avgPrice: 98.50, currentPrice: 105.60, assetClass: 'unit_trust', positionType: 'long', broker: 'IBKR', platform: 'TWS' },
    { id: '11', symbol: 'SWDA', name: 'iShares MSCI World', quantity: 80, avgPrice: 75.00, currentPrice: 82.50, assetClass: 'unit_trust', positionType: 'long', broker: 'Saxo', platform: 'SaxoTraderGO' },
    // ETFs (~$20k notional)
    { id: '7', symbol: 'SPY', name: 'S&P 500 ETF', quantity: 25, avgPrice: 450.00, currentPrice: 505.80, assetClass: 'etf', positionType: 'long', broker: 'Schwab', platform: 'Web' },
    { id: '12', symbol: 'QQQ', name: 'Invesco QQQ', quantity: 20, avgPrice: 380.00, currentPrice: 445.20, assetClass: 'etf', positionType: 'long', broker: 'Robinhood', platform: 'Mobile App' },
    // Commodities (~$18k notional)
    { id: '8', symbol: 'XAUUSD', name: 'Gold', quantity: 6, avgPrice: 1950.00, currentPrice: 2350.50, assetClass: 'commodity', positionType: 'long', broker: 'IG', platform: 'MT5' },
    { id: '13', symbol: 'XAGUSD', name: 'Silver', quantity: 150, avgPrice: 23.50, currentPrice: 28.75, assetClass: 'commodity', positionType: 'long', broker: 'OANDA', platform: 'TradingView' },
];

// Use distinct colors for each asset class - ensure high contrast between all
const assetClassConfig: Record<string, { bg: string; text: string; label: string; icon: string; borderColor: string }> = {
    'crypto': { bg: '#f59e0b', text: '#000', label: 'Cryptocurrency', icon: '₿', borderColor: '#f59e0b' },  // Orange/Amber
    'forex': { bg: '#10b981', text: '#fff', label: 'Forex', icon: '💱', borderColor: '#10b981' },           // Emerald Green
    'stock': { bg: '#3b82f6', text: '#fff', label: 'Stocks', icon: '📈', borderColor: '#3b82f6' },          // Blue
    'unit_trust': { bg: '#a855f7', text: '#fff', label: 'Unit Trusts', icon: '🏦', borderColor: '#a855f7' },// Purple
    'etf': { bg: '#ec4899', text: '#fff', label: 'ETFs', icon: '📊', borderColor: '#ec4899' },              // Pink (was orange, now distinct)
    'commodity': { bg: '#eab308', text: '#000', label: 'Commodities', icon: '🥇', borderColor: '#eab308' }, // Yellow/Gold
};

export default function PortfolioPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccountId, setSelectedAccountId] = useState<string>('');
    const [positions, setPositions] = useState<Position[]>(mockPositions);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        crypto: true, forex: true, stock: true, unit_trust: true, etf: true, commodity: true
    });

    // Upload state
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadPreview, setUploadPreview] = useState<string>('');
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'extracted' | 'error'>('idle');
    const [extractedPositions, setExtractedPositions] = useState<any[]>([]);
    const [importId, setImportId] = useState<string>('');
    const [uploadError, setUploadError] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    // Manual position entry state
    const [showManualModal, setShowManualModal] = useState(false);
    const [manualPosition, setManualPosition] = useState({
        symbol: '',
        name: '',
        quantity: '',
        avgPrice: '',
        currentPrice: '',
        assetClass: 'stock',
        positionType: 'long',
        broker: '',
        platform: '',
        expiry: '',
        customAssetClass: '',
        customPositionType: '',
        customBroker: '',
        customPlatform: ''
    });

    const [priceSource, setPriceSource] = useState<string>('loading...');

    // Fetch real prices on mount and every 30 seconds
    const fetchPrices = useCallback(async () => {
        try {
            const priceData = await fetchAllPrices(
                positions.map(p => ({ symbol: p.symbol, assetClass: p.assetClass }))
            );

            if (Object.keys(priceData).length > 0) {
                setPositions(prev => prev.map(p => {
                    const newPrice = priceData[p.symbol];
                    if (newPrice) {
                        return { ...p, currentPrice: newPrice.price };
                    }
                    return p;
                }));
                setPriceSource('Live prices from Binance, Yahoo Finance, ExchangeRate API');
            }
        } catch (error) {
            console.log('Price fetch failed, using cached prices');
            setPriceSource('Cached prices (API unavailable)');
        }
    }, []);

    useEffect(() => {
        loadAccounts();
        fetchPrices(); // Initial fetch

        // Refresh prices every 30 seconds
        const interval = setInterval(fetchPrices, 30000);
        return () => clearInterval(interval);
    }, [fetchPrices]);

    const loadAccounts = async () => {
        try {
            const response = await accountsAPI.getAccounts();
            setAccounts(response.data);
            if (response.data.length > 0) {
                setSelectedAccountId(response.data[0].id);
            }
        } catch (error) {
            console.log('API not available, using demo mode');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSection = (assetClass: string) => {
        setExpandedSections(prev => ({ ...prev, [assetClass]: !prev[assetClass] }));
    };

    // Upload handlers
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            setUploadFile(file);
            setUploadPreview(URL.createObjectURL(file));
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadFile(file);
            setUploadPreview(URL.createObjectURL(file));
        }
    };

    const handleUpload = async () => {
        if (!uploadFile) return;
        setUploadStatus('uploading');
        setUploadError('');

        try {
            const accountId = selectedAccountId || 'demo-account';
            const response = await portfolioImportAPI.upload(accountId, uploadFile);
            setImportId(response.data.id);
            // Auto-classify extracted positions
            const positionsWithClass = (response.data.extractedData?.positions || []).map((p: any) => ({
                ...p,
                assetClass: classifySymbol(p.symbol),
            }));
            setExtractedPositions(positionsWithClass);
            setUploadStatus('extracted');
        } catch (err: any) {
            setUploadError(err.response?.data?.message || 'Failed to process image. Make sure the API server is running.');
            setUploadStatus('error');
        }
    };

    const handleConfirmImport = async () => {
        if (!importId) return;
        try {
            await portfolioImportAPI.updatePositions(importId, extractedPositions);
            await portfolioImportAPI.confirm(importId);
            const newPositions = extractedPositions.map((p, idx) => ({
                id: `imported-${Date.now()}-${idx}`,
                symbol: p.symbol,
                name: p.symbol,
                quantity: p.quantity,
                avgPrice: p.avgPrice,
                currentPrice: p.currentPrice || p.avgPrice,
                assetClass: p.assetClass || 'stock',
                positionType: 'long' as const,
            }));
            setPositions([...positions, ...newPositions]);
            resetUpload();
        } catch (err: any) {
            setUploadError(err.response?.data?.message || 'Failed to confirm import');
        }
    };

    const resetUpload = () => {
        setShowUploadModal(false);
        setUploadFile(null);
        setUploadPreview('');
        setUploadStatus('idle');
        setExtractedPositions([]);
        setImportId('');
        setUploadError('');
    };

    // Manual position entry handlers
    const updateManualPosition = (field: string, value: string) => {
        if (field === 'symbol') {
            const classified = classifySymbol(value);
            setManualPosition(prev => ({
                ...prev,
                symbol: value.toUpperCase(),
                assetClass: classified,
                name: value.toUpperCase()
            }));
        } else {
            setManualPosition(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleManualSubmit = () => {
        if (!manualPosition.symbol || !manualPosition.quantity || !manualPosition.avgPrice) {
            alert('Please fill in Symbol, Quantity, and Entry Price');
            return;
        }

        const newPosition: Position = {
            id: `manual-${Date.now()}`,
            symbol: manualPosition.symbol.toUpperCase(),
            name: manualPosition.name || manualPosition.symbol.toUpperCase(),
            quantity: parseFloat(manualPosition.quantity) || 0,
            avgPrice: parseFloat(manualPosition.avgPrice) || 0,
            currentPrice: parseFloat(manualPosition.currentPrice) || parseFloat(manualPosition.avgPrice) || 0,
            assetClass: manualPosition.assetClass,
            positionType: manualPosition.positionType as Position['positionType'],
            broker: manualPosition.broker || undefined,
            platform: manualPosition.platform || undefined,
            expiry: manualPosition.expiry || undefined
        };

        setPositions(prev => [...prev, newPosition]);
        resetManualPosition();
    };

    const resetManualPosition = () => {
        setShowManualModal(false);
        setManualPosition({
            symbol: '',
            name: '',
            quantity: '',
            avgPrice: '',
            currentPrice: '',
            assetClass: 'stock',
            positionType: 'long',
            broker: '',
            platform: '',
            expiry: '',
            customAssetClass: '',
            customPositionType: '',
            customBroker: '',
            customPlatform: ''
        });
    };

    const updateExtractedPosition = (idx: number, field: string, value: string) => {
        const updated = [...extractedPositions];
        if (field === 'symbol') {
            updated[idx] = {
                ...updated[idx],
                symbol: value.toUpperCase(),
                // Auto-reclassify when symbol changes
                assetClass: classifySymbol(value),
            };
        } else if (field === 'assetClass' || field === 'broker' || field === 'platform') {
            // String fields
            updated[idx] = { ...updated[idx], [field]: value };
        } else {
            // Numeric fields (quantity, avgPrice)
            updated[idx] = { ...updated[idx], [field]: parseFloat(value) || 0 };
        }
        setExtractedPositions(updated);
    };

    // Calculations
    const groupedPositions = positions.reduce((acc, pos) => {
        if (!acc[pos.assetClass]) acc[pos.assetClass] = [];
        acc[pos.assetClass].push(pos);
        return acc;
    }, {} as Record<string, Position[]>);

    const calculateNotional = (pos: Position) => pos.quantity * pos.currentPrice * (pos.leverage || 1);
    const calculatePnL = (pos: Position) => (pos.currentPrice - pos.avgPrice) * pos.quantity * (pos.leverage || 1);
    const calculatePnLPercent = (pos: Position) => ((pos.currentPrice - pos.avgPrice) / pos.avgPrice) * 100;

    const totalNotional = positions.reduce((sum, p) => sum + calculateNotional(p), 0);
    const totalPnL = positions.reduce((sum, p) => sum + calculatePnL(p), 0);

    const exposure = Object.entries(groupedPositions).map(([assetClass, classPositions]) => {
        const value = classPositions.reduce((sum, p) => sum + calculateNotional(p), 0);
        return {
            assetClass,
            ...assetClassConfig[assetClass],
            value,
            percentage: (value / totalNotional) * 100,
            posCount: classPositions.length,
        };
    }).sort((a, b) => b.value - a.value);

    // Compute pie chart gradient - must be done outside JSX to avoid hydration issues
    const pieChartGradient = React.useMemo(() => {
        let gradientStops: string[] = [];
        let currentPercent = 0;
        exposure.forEach((item) => {
            const startPercent = currentPercent;
            const endPercent = currentPercent + item.percentage;
            gradientStops.push(`${item.bg} ${startPercent}% ${endPercent}%`);
            currentPercent = endPercent;
        });
        return `conic-gradient(from 0deg, ${gradientStops.join(', ')})`;
    }, [exposure]);

    const displayUser = user || { email: 'demo@preview.com' };

    if (authLoading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a1628' }}>
                <div style={{ fontSize: '1.5rem', color: '#fff' }}>Loading...</div>
            </div>
        );
    }

    // Get position badge color and letter
    const getPositionBadge = (pos: Position, config: typeof assetClassConfig[string]) => {
        if (pos.positionType === 'long' || pos.positionType === 'spot') {
            return { letter: 'L', bg: config.bg };
        } else if (pos.positionType === 'short') {
            return { letter: 'S', bg: '#ef4444' };
        } else if (pos.positionType === 'perpetual') {
            return { letter: 'L', bg: config.bg };
        } else if (pos.positionType === 'option') {
            return { letter: 'L', bg: config.bg };
        }
        return { letter: 'L', bg: config.bg };
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0a1628', color: '#e2e8f0', fontFamily: 'Inter, system-ui, sans-serif' }}>
            {/* Header */}
            <header style={{ backgroundColor: '#0d1f3c', borderBottom: '1px solid #1e3a5f', padding: '12px 0' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#00d4ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#0a1628' }}>D</span>
                        </div>
                        <div>
                            <h1 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#fff' }}>Decyphers</h1>
                            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>AI Trading Mentor</p>
                        </div>
                    </div>
                    <nav style={{ display: 'flex', gap: '32px' }}>
                        <Link href="/portfolio" style={{ fontWeight: '500', color: '#00d4ff', textDecoration: 'none' }}>Portfolio</Link>
                        <Link href="/watchlist" style={{ fontWeight: '500', color: '#64748b', textDecoration: 'none' }}>Watchlist</Link>
                        <Link href="/analysis" style={{ fontWeight: '500', color: '#64748b', textDecoration: 'none' }}>Analysis</Link>
                        <Link href="/ai-mentor" style={{ fontWeight: '500', color: '#64748b', textDecoration: 'none' }}>AI Mentor</Link>
                    </nav>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button
                            onClick={() => setShowManualModal(true)}
                            style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', backgroundColor: '#1e3a5f', color: '#fff', border: '1px solid #3f4f66', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            ➕ Add Position
                        </button>
                        <button
                            onClick={() => setShowUploadModal(true)}
                            style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', backgroundColor: '#00d4ff', color: '#0a1628', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            📸 AI Import
                        </button>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontWeight: 'bold', color: '#000' }}>{displayUser.email?.[0]?.toUpperCase()}</span>
                        </div>
                    </div>
                </div>
            </header>

            <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
                {/* Portfolio Summary Cards */}
                {(() => {
                    const totalInitialValue = positions.reduce((sum, p) => sum + (p.avgPrice * p.quantity), 0);
                    const totalCurrentValue = positions.reduce((sum, p) => sum + (p.currentPrice * p.quantity), 0);
                    const unrealizedPnL = totalPnL;
                    const totalReturnPercent = totalInitialValue > 0 ? ((unrealizedPnL / totalInitialValue) * 100) : 0;
                    // Simulate daily change (in real app, would come from yesterday's close)
                    const dailyChange = unrealizedPnL * 0.15; // ~15% of total unrealized for demo
                    const dailyChangePercent = totalCurrentValue > 0 ? ((dailyChange / totalCurrentValue) * 100) : 0;

                    const cards = [
                        {
                            label: 'Portfolio Value',
                            value: `$${totalNotional.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                            subValue: `${positions.length} active positions`,
                            icon: '💎',
                            color: '#00d4ff'
                        },
                        {
                            label: 'Capital Invested',
                            value: `$${totalInitialValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                            subValue: 'Total capital deployed',
                            icon: '💰',
                            color: '#8b5cf6'
                        },
                        {
                            label: 'Total Returns',
                            value: `${unrealizedPnL >= 0 ? '+' : ''}$${unrealizedPnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                            subValue: `${totalReturnPercent >= 0 ? '↑' : '↓'} ${Math.abs(totalReturnPercent).toFixed(2)}% all-time`,
                            icon: unrealizedPnL >= 0 ? '🚀' : '📉',
                            color: unrealizedPnL >= 0 ? '#10b981' : '#ef4444',
                            isPositive: unrealizedPnL >= 0
                        },
                        {
                            label: "Today's Gain",
                            value: `${dailyChange >= 0 ? '+' : ''}$${dailyChange.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                            subValue: `${dailyChangePercent >= 0 ? '↑' : '↓'} ${Math.abs(dailyChangePercent).toFixed(2)}% today`,
                            icon: dailyChange >= 0 ? '🔥' : '❄️',
                            color: dailyChange >= 0 ? '#10b981' : '#ef4444',
                            isPositive: dailyChange >= 0
                        },
                    ];

                    return (
                        <div className="header-cards-grid" style={{ marginBottom: '32px' }}>
                            {cards.map((card, idx) => (
                                <div
                                    key={idx}
                                    className="info-card"
                                    style={{ position: 'relative', zIndex: 1 }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                        <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '500', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{card.label}</span>
                                        <span className="float-icon" style={{ fontSize: '24px' }}>{card.icon}</span>
                                    </div>
                                    <div style={{
                                        fontSize: '28px',
                                        fontWeight: '700',
                                        color: card.color,
                                        marginBottom: '8px',
                                        letterSpacing: '-0.5px'
                                    }}>
                                        {card.value}
                                    </div>
                                    <div style={{
                                        fontSize: '13px',
                                        color: card.isPositive !== undefined ? card.color : '#64748b',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}>
                                        {card.isPositive !== undefined && (
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '50%',
                                                backgroundColor: card.isPositive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                                fontSize: '10px'
                                            }}>
                                                {card.isPositive ? '▲' : '▼'}
                                            </span>
                                        )}
                                        {card.subValue}
                                    </div>
                                    {/* Animated bottom accent line */}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        height: '2px',
                                        background: `linear-gradient(90deg, ${card.color}, ${card.color}66, transparent)`,
                                        opacity: 0.8
                                    }}></div>
                                </div>
                            ))}
                        </div>
                    );
                })()}

                <div className="portfolio-main-grid">
                    {/* Holdings - Left Side */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {Object.entries(groupedPositions).map(([assetClass, classPositions]) => {
                            const config = assetClassConfig[assetClass];
                            const sectionNotional = classPositions.reduce((sum, p) => sum + calculateNotional(p), 0);
                            const sectionPnL = classPositions.reduce((sum, p) => sum + calculatePnL(p), 0);
                            const isExpanded = expandedSections[assetClass];

                            return (
                                <div key={assetClass} className="section-card" style={{ backgroundColor: '#0d1f3c' }}>
                                    {/* Section Header */}
                                    <div
                                        onClick={() => toggleSection(assetClass)}
                                        style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            padding: '12px 16px', cursor: 'pointer',
                                            borderBottom: isExpanded ? '1px solid #1e3a5f' : 'none'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                                padding: '4px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '600',
                                                backgroundColor: config.bg, color: config.text
                                            }}>
                                                {config.icon} {config.label}
                                            </span>
                                            <span style={{ fontSize: '13px', color: '#64748b' }}>{classPositions.length} position{classPositions.length > 1 ? 's' : ''}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '13px' }}>
                                            <span>Notional: <span style={{ fontWeight: '600', color: '#fff' }}>${sectionNotional.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></span>
                                            <span>P&L: <span style={{ fontWeight: '600', color: sectionPnL >= 0 ? '#22c55e' : '#ef4444' }}>
                                                ${Math.abs(sectionPnL).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span></span>
                                        </div>
                                    </div>

                                    {/* Position Table */}
                                    {isExpanded && (
                                        <div style={{ padding: '0 16px 16px' }}>
                                            <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                                                <thead>
                                                    <tr style={{ color: '#64748b' }}>
                                                        <th style={{ textAlign: 'left', padding: '12px 0', fontWeight: '500', borderBottom: '1px solid #1e3a5f33' }}>POSITION</th>
                                                        <th style={{ textAlign: 'right', padding: '12px 0', fontWeight: '500', borderBottom: '1px solid #1e3a5f33' }}>QUANTITY</th>
                                                        <th style={{ textAlign: 'right', padding: '12px 0', fontWeight: '500', borderBottom: '1px solid #1e3a5f33' }}>ENTRY</th>
                                                        <th style={{ textAlign: 'right', padding: '12px 0', fontWeight: '500', borderBottom: '1px solid #1e3a5f33' }}>CURRENT</th>
                                                        <th style={{ textAlign: 'right', padding: '12px 0', fontWeight: '500', borderBottom: '1px solid #1e3a5f33' }}>P&L</th>
                                                        <th style={{ textAlign: 'center', padding: '12px 0', fontWeight: '500', borderBottom: '1px solid #1e3a5f33' }}>BROKER</th>
                                                        <th style={{ textAlign: 'center', padding: '12px 0', fontWeight: '500', borderBottom: '1px solid #1e3a5f33' }}>PLATFORM</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {classPositions.map(pos => {
                                                        const pnl = calculatePnL(pos);
                                                        const pnlPct = calculatePnLPercent(pos);
                                                        const notional = calculateNotional(pos);
                                                        const badge = getPositionBadge(pos, config);

                                                        return (
                                                            <tr key={pos.id} style={{ borderBottom: '1px solid #1e3a5f22' }}>
                                                                <td style={{ padding: '14px 0' }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                                        <div style={{
                                                                            width: '32px', height: '32px', borderRadius: '50%',
                                                                            backgroundColor: badge.bg, color: '#000',
                                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                            fontSize: '14px', fontWeight: 'bold'
                                                                        }}>
                                                                            {badge.letter}
                                                                        </div>
                                                                        <div>
                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                <span style={{ fontWeight: '600', color: '#fff' }}>{pos.symbol}</span>
                                                                                {pos.positionType === 'perpetual' && (
                                                                                    <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', backgroundColor: '#00d4ff22', color: '#00d4ff' }}>PERPETUAL</span>
                                                                                )}
                                                                                {pos.positionType === 'option' && (
                                                                                    <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', backgroundColor: '#22c55e22', color: '#22c55e' }}>OPTION</span>
                                                                                )}
                                                                            </div>
                                                                            <span style={{ fontSize: '12px', color: '#64748b' }}>{pos.name}</span>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td style={{ textAlign: 'right', padding: '14px 0' }}>
                                                                    <span style={{ color: '#e2e8f0' }}>{pos.quantity}</span>
                                                                    {pos.leverage && pos.leverage > 1 && (
                                                                        <span style={{ marginLeft: '6px', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', backgroundColor: '#3b82f622', color: '#3b82f6' }}>{pos.leverage}x</span>
                                                                    )}
                                                                </td>
                                                                <td style={{ textAlign: 'right', padding: '14px 0', color: '#e2e8f0' }}>${pos.avgPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                                <td style={{ textAlign: 'right', padding: '14px 0', fontWeight: '600', color: '#fff' }}>${pos.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                                <td style={{ textAlign: 'right', padding: '14px 0' }}>
                                                                    <div style={{ color: pnl >= 0 ? '#22c55e' : '#ef4444', fontWeight: '500' }}>
                                                                        {pnl >= 0 ? '↗' : '↘'} ${Math.abs(pnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                    </div>
                                                                    <div style={{ fontSize: '11px', color: pnl >= 0 ? '#22c55e' : '#ef4444' }}>
                                                                        {pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
                                                                    </div>
                                                                </td>
                                                                <td style={{ textAlign: 'center', padding: '14px 0' }}>
                                                                    <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '500', backgroundColor: '#3b82f622', color: '#3b82f6' }}>
                                                                        {pos.broker || '—'}
                                                                    </span>
                                                                </td>
                                                                <td style={{ textAlign: 'center', padding: '14px 0' }}>
                                                                    <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '500', backgroundColor: '#a855f722', color: '#a855f7' }}>
                                                                        {pos.platform || '—'}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Right Sidebar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Donut Chart */}
                        <div style={{ backgroundColor: '#0d1f3c', borderRadius: '12px', border: '1px solid #1e3a5f', padding: '24px' }}>
                            <div style={{ position: 'relative', width: '200px', height: '200px', margin: '0 auto 24px' }}>
                                {/* Donut chart using conic-gradient for smooth segments */}
                                <div style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '50%',
                                    background: pieChartGradient,
                                    WebkitMask: 'radial-gradient(circle at center, transparent 55%, black 55%)',
                                    mask: 'radial-gradient(circle at center, transparent 55%, black 55%)',
                                }}></div>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', fontSize: '11px' }}>
                                {exposure.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 8px', borderRadius: '4px', backgroundColor: '#1e3a5f33' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.bg }}></div>
                                        <span style={{ color: '#94a3b8' }}>{item.label}</span>
                                        <span style={{ fontWeight: '600', color: '#fff' }}>{item.percentage.toFixed(1)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Exposure Breakdown */}
                        <div style={{ backgroundColor: '#0d1f3c', borderRadius: '12px', border: '1px solid #1e3a5f', padding: '24px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', color: '#fff' }}>Exposure Breakdown</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {exposure.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: item.bg }}></div>
                                            <span style={{ color: '#e2e8f0' }}>{item.label}</span>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: '600', color: '#fff' }}>${item.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                            <div style={{ fontSize: '11px', color: '#64748b' }}>{item.posCount} pos</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* AI Import Modal */}
            {showUploadModal && (
                <div className="modal-overlay">
                    <div className="ai-import-modal" style={{ backgroundColor: '#0d1f3c', borderRadius: '16px' }}>
                        <div style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>📸 AI Portfolio Import</h3>
                                <button onClick={resetUpload} style={{ fontSize: '24px', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
                            </div>

                            {uploadStatus === 'idle' && (
                                <>
                                    <p style={{ fontSize: '14px', marginBottom: '16px', color: '#64748b' }}>
                                        Upload a screenshot of your portfolio from another broker. Our AI (Qwen 2.5 VL via OpenRouter) will extract the positions automatically.
                                    </p>
                                    <div
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        style={{
                                            border: `2px dashed ${isDragging ? '#00d4ff' : '#3f4f66'}`,
                                            borderRadius: '12px',
                                            padding: '32px',
                                            textAlign: 'center',
                                            backgroundColor: isDragging ? 'rgba(0,212,255,0.1)' : 'transparent',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {uploadPreview ? (
                                            <div>
                                                <img src={uploadPreview} alt="Preview" style={{ maxHeight: '160px', margin: '0 auto', borderRadius: '8px', marginBottom: '16px' }} />
                                                <button onClick={() => { setUploadFile(null); setUploadPreview(''); }} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
                                            </div>
                                        ) : (
                                            <div>
                                                <p style={{ fontSize: '32px', marginBottom: '8px' }}>📤</p>
                                                <p style={{ marginBottom: '12px', color: '#e2e8f0' }}>Drag and drop screenshot</p>
                                                <label style={{ padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'inline-block', backgroundColor: '#1e3a5f', color: '#fff' }}>
                                                    Browse
                                                    <input type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                    {uploadFile && (
                                        <button onClick={handleUpload} style={{ width: '100%', marginTop: '16px', padding: '12px', borderRadius: '8px', fontWeight: '500', backgroundColor: '#00d4ff', color: '#0a1628', border: 'none', cursor: 'pointer' }}>
                                            🤖 Extract with AI
                                        </button>
                                    )}
                                </>
                            )}

                            {uploadStatus === 'uploading' && (
                                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                                    <div style={{ fontSize: '32px', marginBottom: '16px', animation: 'spin 1s linear infinite' }}>⚙️</div>
                                    <p style={{ color: '#e2e8f0' }}>AI is analyzing your screenshot...</p>
                                    <p style={{ fontSize: '12px', marginTop: '8px', color: '#64748b' }}>Using Qwen 2.5 VL via OpenRouter</p>
                                </div>
                            )}

                            {uploadStatus === 'error' && (
                                <div style={{ padding: '16px', borderRadius: '8px', marginBottom: '16px', backgroundColor: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444' }}>
                                    <p style={{ color: '#ef4444' }}>{uploadError}</p>
                                    <button onClick={() => setUploadStatus('idle')} style={{ textDecoration: 'underline', marginTop: '8px', color: '#fff', background: 'none', border: 'none', cursor: 'pointer' }}>Try Again</button>
                                </div>
                            )}

                            {uploadStatus === 'extracted' && (
                                <>
                                    <p style={{ fontSize: '12px', marginBottom: '10px', color: '#64748b' }}>Review extracted positions:</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '350px', overflowY: 'auto' }}>
                                        {extractedPositions.map((pos, idx) => {
                                            const selectedClass = assetClassOptions.find(o => o.value === pos.assetClass) || assetClassOptions[2];
                                            const isOption = pos.positionType === 'option';
                                            return (
                                                <div key={idx} style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#1e3a5f', borderLeft: `3px solid ${selectedClass.color}` }}>
                                                    {/* Row 1: Symbol, Qty, Entry Price, Category */}
                                                    <div className="position-grid-row1" style={{ marginBottom: '8px' }}>
                                                        <div>
                                                            <label style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>Symbol</label>
                                                            <input value={pos.symbol} onChange={e => updateExtractedPosition(idx, 'symbol', e.target.value)}
                                                                style={{ padding: '6px', borderRadius: '4px', fontSize: '12px', backgroundColor: '#0a1628', color: '#fff', border: '1px solid #3f4f66', fontWeight: '600', width: '100%' }} />
                                                        </div>
                                                        <div>
                                                            <label style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>Qty</label>
                                                            <input type="number" value={pos.quantity} onChange={e => updateExtractedPosition(idx, 'quantity', e.target.value)}
                                                                style={{ padding: '6px', borderRadius: '4px', fontSize: '12px', backgroundColor: '#0a1628', color: '#fff', border: '1px solid #3f4f66', textAlign: 'right', width: '100%' }} />
                                                        </div>
                                                        <div>
                                                            <label style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>Entry $</label>
                                                            <input type="number" value={pos.avgPrice} onChange={e => updateExtractedPosition(idx, 'avgPrice', e.target.value)}
                                                                style={{ padding: '6px', borderRadius: '4px', fontSize: '12px', backgroundColor: '#0a1628', color: '#fff', border: '1px solid #3f4f66', textAlign: 'right', width: '100%' }} />
                                                        </div>
                                                        <div>
                                                            <label style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>Category</label>
                                                            <select value={pos.assetClass || 'stock'} onChange={e => updateExtractedPosition(idx, 'assetClass', e.target.value)}
                                                                style={{ padding: '6px', borderRadius: '4px', fontSize: '11px', backgroundColor: '#0a1628', color: selectedClass.color, border: `1px solid ${selectedClass.color}40`, cursor: 'pointer', width: '100%' }}>
                                                                {assetClassOptions.map(opt => (<option key={opt.value} value={opt.value}>{opt.icon} {opt.label}</option>))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    {/* Row 2: Broker, Platform, Expiry (if option) */}
                                                    <div className={`position-grid-row2 ${isOption ? 'with-expiry' : ''}`}>
                                                        <div>
                                                            <label style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>Broker</label>
                                                            <select value={pos.broker || ''} onChange={e => updateExtractedPosition(idx, 'broker', e.target.value)}
                                                                style={{ padding: '6px', borderRadius: '4px', fontSize: '11px', backgroundColor: '#0a1628', color: '#94a3b8', border: '1px solid #3f4f66', cursor: 'pointer', width: '100%' }}>
                                                                <option value="">Select Broker</option>
                                                                <option value="ibkr">IBKR</option>
                                                                <option value="td_ameritrade">TD Ameritrade</option>
                                                                <option value="fidelity">Fidelity</option>
                                                                <option value="schwab">Schwab</option>
                                                                <option value="etrade">E*TRADE</option>
                                                                <option value="robinhood">Robinhood</option>
                                                                <option value="webull">Webull</option>
                                                                <option value="binance">Binance</option>
                                                                <option value="coinbase">Coinbase</option>
                                                                <option value="kraken">Kraken</option>
                                                                <option value="oanda">OANDA</option>
                                                                <option value="ig">IG</option>
                                                                <option value="saxo">Saxo</option>
                                                                <option value="tiger">Tiger</option>
                                                                <option value="moomoo">Moomoo</option>
                                                                <option value="other">Other</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>Platform</label>
                                                            <select value={pos.platform || ''} onChange={e => updateExtractedPosition(idx, 'platform', e.target.value)}
                                                                style={{ padding: '6px', borderRadius: '4px', fontSize: '11px', backgroundColor: '#0a1628', color: '#94a3b8', border: '1px solid #3f4f66', cursor: 'pointer', width: '100%' }}>
                                                                <option value="">Select Platform</option>
                                                                <option value="tws">TWS</option>
                                                                <option value="thinkorswim">thinkorSwim</option>
                                                                <option value="mt4">MT4</option>
                                                                <option value="mt5">MT5</option>
                                                                <option value="tradingview">TradingView</option>
                                                                <option value="mobile">Mobile App</option>
                                                                <option value="web">Web</option>
                                                                <option value="other">Other</option>
                                                            </select>
                                                        </div>
                                                        {isOption && (
                                                            <div>
                                                                <label style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>Expiry</label>
                                                                <input type="date" value={pos.expiry || ''} onChange={e => updateExtractedPosition(idx, 'expiry', e.target.value)}
                                                                    style={{ padding: '5px', borderRadius: '4px', fontSize: '11px', backgroundColor: '#0a1628', color: '#fff', border: '1px solid #3f4f66', width: '100%' }} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    {/* Option toggle */}
                                                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <label style={{ fontSize: '10px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                                                            <input type="checkbox" checked={pos.positionType === 'option'} onChange={e => updateExtractedPosition(idx, 'positionType', e.target.checked ? 'option' : 'long')}
                                                                style={{ accentColor: '#22c55e' }} />
                                                            <span>This is an Option</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                                        <button onClick={resetUpload} style={{ flex: 1, padding: '10px', borderRadius: '6px', fontSize: '13px', backgroundColor: '#1e3a5f', color: '#fff', border: 'none', cursor: 'pointer' }}>Cancel</button>
                                        <button onClick={handleConfirmImport} style={{ flex: 1, padding: '10px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', backgroundColor: '#00d4ff', color: '#0a1628', border: 'none', cursor: 'pointer' }}>
                                            Import {extractedPositions.length} Positions
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Manual Position Entry Modal */}
            {showManualModal && (
                <div className="modal-overlay">
                    <div className="ai-import-modal" style={{ backgroundColor: '#0d1f3c', borderRadius: '16px' }}>
                        <div style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>➕ Add New Position</h3>
                                <button onClick={resetManualPosition} style={{ fontSize: '24px', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
                            </div>

                            <p style={{ fontSize: '14px', marginBottom: '20px', color: '#64748b' }}>
                                Manually add a position to your portfolio.
                            </p>

                            {/* Row 1: Category, Position Type */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                <div>
                                    <label style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Category *</label>
                                    <select
                                        value={manualPosition.assetClass}
                                        onChange={e => updateManualPosition('assetClass', e.target.value)}
                                        style={{ padding: '10px', borderRadius: '6px', fontSize: '14px', backgroundColor: '#0a1628', color: '#fff', border: '1px solid #3f4f66', width: '100%', cursor: 'pointer' }}
                                    >
                                        {assetClassOptions.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.icon} {opt.label}</option>
                                        ))}
                                        <option value="other">📝 Other</option>
                                    </select>
                                    {manualPosition.assetClass === 'other' && (
                                        <input
                                            value={manualPosition.customAssetClass || ''}
                                            onChange={e => updateManualPosition('customAssetClass', e.target.value)}
                                            placeholder="Enter custom category..."
                                            style={{ padding: '8px', borderRadius: '6px', fontSize: '13px', backgroundColor: '#0a1628', color: '#fff', border: '1px solid #3f4f66', width: '100%', marginTop: '6px' }}
                                        />
                                    )}
                                </div>
                                <div>
                                    <label style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Position Type</label>
                                    <select
                                        value={manualPosition.positionType}
                                        onChange={e => updateManualPosition('positionType', e.target.value)}
                                        style={{ padding: '10px', borderRadius: '6px', fontSize: '14px', backgroundColor: '#0a1628', color: '#fff', border: '1px solid #3f4f66', width: '100%', cursor: 'pointer' }}
                                    >
                                        <option value="long">📈 Long</option>
                                        <option value="short">📉 Short</option>
                                        <option value="spot">💰 Spot</option>
                                        <option value="perpetual">♾️ Perpetual</option>
                                        <option value="option">📋 Option</option>
                                        <option value="other">📝 Other</option>
                                    </select>
                                    {manualPosition.positionType === 'other' && (
                                        <input
                                            value={manualPosition.customPositionType || ''}
                                            onChange={e => updateManualPosition('customPositionType', e.target.value)}
                                            placeholder="Enter custom type..."
                                            style={{ padding: '8px', borderRadius: '6px', fontSize: '13px', backgroundColor: '#0a1628', color: '#fff', border: '1px solid #3f4f66', width: '100%', marginTop: '6px' }}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Row 2: Symbol, Name */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                <div>
                                    <label style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Symbol *</label>
                                    <input
                                        value={manualPosition.symbol}
                                        onChange={e => updateManualPosition('symbol', e.target.value)}
                                        placeholder="AAPL, BTCUSD, EURUSD..."
                                        style={{ padding: '10px', borderRadius: '6px', fontSize: '14px', backgroundColor: '#0a1628', color: '#fff', border: '1px solid #3f4f66', width: '100%', fontWeight: '600' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Name</label>
                                    <input
                                        value={manualPosition.name}
                                        onChange={e => updateManualPosition('name', e.target.value)}
                                        placeholder="Apple Inc, Bitcoin..."
                                        style={{ padding: '10px', borderRadius: '6px', fontSize: '14px', backgroundColor: '#0a1628', color: '#fff', border: '1px solid #3f4f66', width: '100%' }}
                                    />
                                </div>
                            </div>

                            {/* Row 3: Quantity, Entry Price, Current Price */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                <div>
                                    <label style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Quantity *</label>
                                    <input
                                        type="number"
                                        value={manualPosition.quantity}
                                        onChange={e => updateManualPosition('quantity', e.target.value)}
                                        placeholder="10"
                                        style={{ padding: '10px', borderRadius: '6px', fontSize: '14px', backgroundColor: '#0a1628', color: '#fff', border: '1px solid #3f4f66', width: '100%', textAlign: 'right' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Entry Price *</label>
                                    <input
                                        type="number"
                                        value={manualPosition.avgPrice}
                                        onChange={e => updateManualPosition('avgPrice', e.target.value)}
                                        placeholder="150.00"
                                        style={{ padding: '10px', borderRadius: '6px', fontSize: '14px', backgroundColor: '#0a1628', color: '#fff', border: '1px solid #3f4f66', width: '100%', textAlign: 'right' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Current Price</label>
                                    <input
                                        type="number"
                                        value={manualPosition.currentPrice}
                                        onChange={e => updateManualPosition('currentPrice', e.target.value)}
                                        placeholder="Auto-fetch"
                                        style={{ padding: '10px', borderRadius: '6px', fontSize: '14px', backgroundColor: '#0a1628', color: '#fff', border: '1px solid #3f4f66', width: '100%', textAlign: 'right' }}
                                    />
                                </div>
                            </div>

                            {/* Row 4: Broker, Platform */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                <div>
                                    <label style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Broker</label>
                                    <select
                                        value={manualPosition.broker}
                                        onChange={e => updateManualPosition('broker', e.target.value)}
                                        style={{ padding: '10px', borderRadius: '6px', fontSize: '14px', backgroundColor: '#0a1628', color: '#94a3b8', border: '1px solid #3f4f66', width: '100%', cursor: 'pointer' }}
                                    >
                                        <option value="">Select Broker</option>
                                        <option value="ibkr">IBKR</option>
                                        <option value="td_ameritrade">TD Ameritrade</option>
                                        <option value="fidelity">Fidelity</option>
                                        <option value="schwab">Schwab</option>
                                        <option value="etrade">E*TRADE</option>
                                        <option value="robinhood">Robinhood</option>
                                        <option value="webull">Webull</option>
                                        <option value="binance">Binance</option>
                                        <option value="coinbase">Coinbase</option>
                                        <option value="kraken">Kraken</option>
                                        <option value="oanda">OANDA</option>
                                        <option value="ig">IG</option>
                                        <option value="saxo">Saxo</option>
                                        <option value="tiger">Tiger</option>
                                        <option value="moomoo">Moomoo</option>
                                        <option value="other">📝 Other</option>
                                    </select>
                                    {manualPosition.broker === 'other' && (
                                        <input
                                            value={manualPosition.customBroker || ''}
                                            onChange={e => updateManualPosition('customBroker', e.target.value)}
                                            placeholder="Enter broker name..."
                                            style={{ padding: '8px', borderRadius: '6px', fontSize: '13px', backgroundColor: '#0a1628', color: '#fff', border: '1px solid #3f4f66', width: '100%', marginTop: '6px' }}
                                        />
                                    )}
                                </div>
                                <div>
                                    <label style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Platform</label>
                                    <select
                                        value={manualPosition.platform}
                                        onChange={e => updateManualPosition('platform', e.target.value)}
                                        style={{ padding: '10px', borderRadius: '6px', fontSize: '14px', backgroundColor: '#0a1628', color: '#94a3b8', border: '1px solid #3f4f66', width: '100%', cursor: 'pointer' }}
                                    >
                                        <option value="">Select Platform</option>
                                        <option value="tws">TWS</option>
                                        <option value="thinkorswim">thinkorSwim</option>
                                        <option value="mt4">MT4</option>
                                        <option value="mt5">MT5</option>
                                        <option value="tradingview">TradingView</option>
                                        <option value="mobile">Mobile App</option>
                                        <option value="web">Web</option>
                                        <option value="other">📝 Other</option>
                                    </select>
                                    {manualPosition.platform === 'other' && (
                                        <input
                                            value={manualPosition.customPlatform || ''}
                                            onChange={e => updateManualPosition('customPlatform', e.target.value)}
                                            placeholder="Enter platform name..."
                                            style={{ padding: '8px', borderRadius: '6px', fontSize: '13px', backgroundColor: '#0a1628', color: '#fff', border: '1px solid #3f4f66', width: '100%', marginTop: '6px' }}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Row 5: Expiry (for options) */}
                            {manualPosition.positionType === 'option' && (
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Expiry Date</label>
                                    <input
                                        type="date"
                                        value={manualPosition.expiry}
                                        onChange={e => updateManualPosition('expiry', e.target.value)}
                                        style={{ padding: '10px', borderRadius: '6px', fontSize: '14px', backgroundColor: '#0a1628', color: '#fff', border: '1px solid #3f4f66', width: '100%' }}
                                    />
                                </div>
                            )}

                            {/* Buttons */}
                            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                <button
                                    onClick={resetManualPosition}
                                    style={{ flex: 1, padding: '12px', borderRadius: '8px', fontSize: '14px', backgroundColor: '#1e3a5f', color: '#fff', border: 'none', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleManualSubmit}
                                    style={{ flex: 1, padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', backgroundColor: '#22c55e', color: '#fff', border: 'none', cursor: 'pointer' }}
                                >
                                    ✓ Add Position
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div >
    );
}
