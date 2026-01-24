'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import { accountsAPI, portfolioImportAPI } from '@/lib/api';
import { fetchAllPrices } from '@/lib/priceService';
import { classifySymbol, assetClassOptions, AssetClass } from '@/lib/symbolClassifier';
import { searchAssets, getAssetBySymbol, AssetInfo } from '@/lib/assetLibrary';
import { PortfolioPerformanceChart, AnimatedValue, Sparkline, generateSparklineData } from '@/components/PortfolioCharts';
import { PortfolioChatbox } from '@/components/PortfolioChatbox';
import { DraggableDashboard, CardData } from '@/components/DraggableDashboard';
import Link from 'next/link';

interface Position {
    id: string;
    symbol: string;
    name: string;
    quantity: number;      // For stocks/crypto: shares, For forex: lot size (0.01 = micro, 0.1 = mini, 1 = standard)
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
    // Forex/CFD specific
    lotSize?: number;      // Standard lot = 1 (100,000 units), Mini = 0.1, Micro = 0.01
    pipValue?: number;     // Value per pip movement
    // Verification fields
    verificationSource?: 'ai_import' | 'api_linked' | 'manual';
    verificationConfidence?: number;
    verifiedAt?: string;
}

interface Account {
    id: string;
    type: string;
    currency: string;
    balance: number;
    positions: Position[];
}

// Broker Account for tracking total balance (including idle cash)
interface BrokerAccount {
    id: string;
    brokerName: string;      // e.g., "Binance", "Coinbase"
    platform?: string;       // e.g., "Binance App", "Coinbase Pro"
    totalBalance: number;    // Total account value
    currency: string;        // USD, USDT, etc.
    lastUpdated: string;     // ISO timestamp
    verificationSource: 'manual' | 'api_linked' | 'ai_import';
}

// Mock broker accounts for demo
const mockBrokerAccounts: BrokerAccount[] = [
    { id: 'ba1', brokerName: 'Binance', platform: 'Binance App', totalBalance: 25000, currency: 'USD', lastUpdated: '2026-01-25T08:00:00Z', verificationSource: 'api_linked' },
    { id: 'ba2', brokerName: 'Coinbase', platform: 'Coinbase Pro', totalBalance: 8000, currency: 'USD', lastUpdated: '2026-01-24T15:30:00Z', verificationSource: 'ai_import' },
    { id: 'ba3', brokerName: 'OANDA', platform: 'MT5', totalBalance: 20000, currency: 'USD', lastUpdated: '2026-01-25T06:00:00Z', verificationSource: 'manual' },
    { id: 'ba4', brokerName: 'IBKR', platform: 'TWS', totalBalance: 35000, currency: 'USD', lastUpdated: '2026-01-25T07:00:00Z', verificationSource: 'api_linked' },
    { id: 'ba5', brokerName: 'IG', platform: 'MT4', totalBalance: 15000, currency: 'USD', lastUpdated: '2026-01-24T20:00:00Z', verificationSource: 'manual' },
];

// Extended mock positions with BALANCED notional values (~$15-20k each asset class for clear pie chart)
const mockPositions: Position[] = [
    // Cryptocurrency (~$20k notional)
    { id: '1', symbol: 'BTCUSD', name: 'Bitcoin', quantity: 0.25, avgPrice: 42500.00, currentPrice: 68000.00, assetClass: 'crypto', positionType: 'long', broker: 'Binance', platform: 'Binance App', verificationSource: 'api_linked', verifiedAt: '2026-01-15T10:30:00Z' },
    { id: '2', symbol: 'ETHUSDT', name: 'Ethereum', quantity: 1.5, avgPrice: 2200.00, currentPrice: 3500.00, assetClass: 'crypto', positionType: 'long', broker: 'Coinbase', platform: 'Coinbase Pro', verificationSource: 'ai_import', verifiedAt: '2026-01-18T14:20:00Z' },
    // Forex CFD (~$18k notional) - Using lot sizes: 1 lot = 100,000 units
    { id: '3', symbol: 'EURUSD', name: 'Euro / US Dollar', quantity: 0.15, avgPrice: 1.0850, currentPrice: 1.0425, assetClass: 'forex', positionType: 'long', lotSize: 0.15, pipValue: 10, broker: 'OANDA', platform: 'MT5', verificationSource: 'ai_import', verifiedAt: '2026-01-17T09:15:00Z' },
    { id: '9', symbol: 'GBPJPY', name: 'GBP/JPY', quantity: 0.1, avgPrice: 185.50, currentPrice: 188.20, assetClass: 'forex', positionType: 'long', lotSize: 0.1, pipValue: 6.35, broker: 'IG', platform: 'MT4', verificationSource: 'manual' },
    // Stocks (~$20k notional)
    { id: '4', symbol: 'TSLA', name: 'Tesla Inc', quantity: 15, avgPrice: 250.00, currentPrice: 438.50, assetClass: 'stock', positionType: 'long', broker: 'IBKR', platform: 'TWS', verificationSource: 'api_linked', verifiedAt: '2026-01-19T08:00:00Z' },
    { id: '5', symbol: 'AAPL', name: 'Apple Inc', quantity: 40, avgPrice: 150.00, currentPrice: 185.20, assetClass: 'stock', positionType: 'long', broker: 'Fidelity', platform: 'Web', verificationSource: 'ai_import', verifiedAt: '2026-01-16T11:45:00Z' },
    { id: '10', symbol: 'NVDA', name: 'NVIDIA Corp', quantity: 8, avgPrice: 450.00, currentPrice: 875.50, assetClass: 'stock', positionType: 'long', broker: 'TD Ameritrade', platform: 'thinkorSwim', verificationSource: 'manual' },
    // Unit Trusts (~$18k notional)
    { id: '6', symbol: 'VWRA', name: 'Vanguard FTSE All-World', quantity: 90, avgPrice: 98.50, currentPrice: 105.60, assetClass: 'unit_trust', positionType: 'long', broker: 'IBKR', platform: 'TWS', verificationSource: 'api_linked', verifiedAt: '2026-01-19T08:00:00Z' },
    { id: '11', symbol: 'SWDA', name: 'iShares MSCI World', quantity: 80, avgPrice: 75.00, currentPrice: 82.50, assetClass: 'unit_trust', positionType: 'long', broker: 'Saxo', platform: 'SaxoTraderGO', verificationSource: 'ai_import', verifiedAt: '2026-01-14T16:30:00Z' },
    // ETFs (~$20k notional)
    { id: '7', symbol: 'SPY', name: 'S&P 500 ETF', quantity: 25, avgPrice: 450.00, currentPrice: 505.80, assetClass: 'etf', positionType: 'long', broker: 'Schwab', platform: 'Web', verificationSource: 'ai_import', verifiedAt: '2026-01-18T10:00:00Z' },
    { id: '12', symbol: 'QQQ', name: 'Invesco QQQ', quantity: 20, avgPrice: 380.00, currentPrice: 445.20, assetClass: 'etf', positionType: 'long', broker: 'Robinhood', platform: 'Mobile App', verificationSource: 'manual' },
    // Commodities (~$18k notional)
    { id: '8', symbol: 'XAUUSD', name: 'Gold', quantity: 6, avgPrice: 1950.00, currentPrice: 2350.50, assetClass: 'commodity', positionType: 'long', broker: 'IG', platform: 'MT5', verificationSource: 'api_linked', verifiedAt: '2026-01-20T07:00:00Z' },
    { id: '13', symbol: 'XAGUSD', name: 'Silver', quantity: 150, avgPrice: 23.50, currentPrice: 28.75, assetClass: 'commodity', positionType: 'long', broker: 'OANDA', platform: 'TradingView', verificationSource: 'manual' },
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

// Forex/CFD Helper Functions
const STANDARD_LOT = 100000; // 1 standard lot = 100,000 units

// Calculate forex notional value (for lot-based positions)
const getForexNotional = (pos: Position): number => {
    if (pos.assetClass === 'forex' && pos.lotSize !== undefined) {
        // Notional = lot size * standard lot * current price
        return pos.lotSize * STANDARD_LOT * pos.currentPrice;
    }
    return pos.quantity * pos.currentPrice;
};

// Calculate forex P&L (pip-based)
const getForexPnL = (pos: Position): number => {
    if (pos.assetClass === 'forex' && pos.lotSize !== undefined) {
        // For forex: P&L = pips moved * pip value * lot size
        const isJpyPair = pos.symbol.includes('JPY');
        const pipMultiplier = isJpyPair ? 100 : 10000; // JPY pairs have 2 decimal pips
        const pipsGained = (pos.currentPrice - pos.avgPrice) * pipMultiplier;
        const pipValue = pos.pipValue || 10; // Default $10 per pip for 1 lot
        return pipsGained * pipValue * pos.lotSize;
    }
    // Standard calculation for non-forex
    return (pos.currentPrice - pos.avgPrice) * pos.quantity;
};

// Format lot size for display
const formatLotSize = (lots: number): string => {
    if (lots >= 1) return `${lots.toFixed(2)} lot${lots !== 1 ? 's' : ''}`;
    if (lots >= 0.1) return `${(lots * 10).toFixed(1)} mini lot${lots !== 0.1 ? 's' : ''}`;
    return `${(lots * 100).toFixed(0)} micro lot${lots !== 0.01 ? 's' : ''}`;
};

// Get pips for forex display
const getForexPips = (pos: Position): number => {
    const isJpyPair = pos.symbol.includes('JPY');
    const pipMultiplier = isJpyPair ? 100 : 10000;
    return (pos.currentPrice - pos.avgPrice) * pipMultiplier;
};

export default function PortfolioPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccountId, setSelectedAccountId] = useState<string>('');
    const [positions, setPositions] = useState<Position[]>(mockPositions);
    const [brokerAccounts, setBrokerAccounts] = useState<BrokerAccount[]>(mockBrokerAccounts);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        crypto: true, forex: true, stock: true, unit_trust: true, etf: true, commodity: true
    });
    const [showAccountsSection, setShowAccountsSection] = useState(true);
    const [showAccountModal, setShowAccountModal] = useState(false);
    const [editingAccount, setEditingAccount] = useState<BrokerAccount | null>(null);

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

    // Symbol search autocomplete state
    const [symbolSuggestions, setSymbolSuggestions] = useState<AssetInfo[]>([]);
    const [showSymbolSuggestions, setShowSymbolSuggestions] = useState(false);
    const symbolInputRef = useRef<HTMLInputElement>(null);

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
            const upperValue = value.toUpperCase();
            // Search the asset library for suggestions
            const suggestions = searchAssets(value, manualPosition.assetClass !== 'other' ? manualPosition.assetClass : undefined);
            setSymbolSuggestions(suggestions);
            setShowSymbolSuggestions(suggestions.length > 0 && value.length > 0);

            // Try to find exact match and auto-fill
            const exactMatch = getAssetBySymbol(value);
            if (exactMatch) {
                setManualPosition(prev => ({
                    ...prev,
                    symbol: exactMatch.symbol,
                    name: exactMatch.name,
                    assetClass: exactMatch.assetClass
                }));
            } else {
                const classified = classifySymbol(value);
                setManualPosition(prev => ({
                    ...prev,
                    symbol: upperValue,
                    assetClass: prev.assetClass === 'other' ? prev.assetClass : classified,
                    name: prev.name || upperValue
                }));
            }
        } else {
            setManualPosition(prev => ({ ...prev, [field]: value }));
        }
    };

    // Handle selecting an asset from suggestions
    const selectAssetSuggestion = (asset: AssetInfo) => {
        setManualPosition(prev => ({
            ...prev,
            symbol: asset.symbol,
            name: asset.name,
            assetClass: asset.assetClass
        }));
        setShowSymbolSuggestions(false);
        setSymbolSuggestions([]);
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

    const calculateNotional = (pos: Position) => {
        if (pos.assetClass === 'forex' && pos.lotSize !== undefined) {
            return getForexNotional(pos);
        }
        return pos.quantity * pos.currentPrice * (pos.leverage || 1);
    };
    const calculatePnL = (pos: Position) => {
        if (pos.assetClass === 'forex' && pos.lotSize !== undefined) {
            return getForexPnL(pos);
        }
        return (pos.currentPrice - pos.avgPrice) * pos.quantity * (pos.leverage || 1);
    };
    const calculatePnLPercent = (pos: Position) => ((pos.currentPrice - pos.avgPrice) / pos.avgPrice) * 100;

    const totalNotional = positions.reduce((sum, p) => sum + calculateNotional(p), 0);
    const totalPnL = positions.reduce((sum, p) => sum + calculatePnL(p), 0);
    const totalInvested = positions.reduce((sum, p) => sum + (p.avgPrice * p.quantity), 0);

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

    // Loading state removed - proceed directly to render

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
                {/* Portfolio Summary Cards - Draggable Dashboard */}
                {(() => {
                    const totalInitialValue = positions.reduce((sum, p) => sum + (p.avgPrice * p.quantity), 0);
                    const totalCurrentValue = positions.reduce((sum, p) => sum + (p.currentPrice * p.quantity), 0);
                    const unrealizedPnL = totalPnL;
                    const totalReturnPercent = totalInitialValue > 0 ? ((unrealizedPnL / totalInitialValue) * 100) : 0;
                    // Simulate daily change (in real app, would come from yesterday's close)
                    const dailyChange = unrealizedPnL * 0.15; // ~15% of total unrealized for demo
                    const dailyChangePercent = totalCurrentValue > 0 ? ((dailyChange / totalCurrentValue) * 100) : 0;

                    // Cash reserves - uninvested money (demo value, would come from account in production)
                    const cashReserves = 5000.00; // Demo: $5,000 cash on standby
                    const totalAssets = totalNotional + cashReserves;
                    const cashPercentage = totalAssets > 0 ? (cashReserves / totalAssets) * 100 : 0;
                    const investedPercentage = totalAssets > 0 ? (totalNotional / totalAssets) * 100 : 0;

                    const dashboardCards: CardData[] = [
                        {
                            id: 'portfolio-value',
                            label: 'Portfolio Value',
                            value: `$${totalNotional.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                            subValue: `${investedPercentage.toFixed(1)}% invested • ${positions.length} positions`,
                            icon: '💎',
                            color: '#00d4ff'
                        },
                        {
                            id: 'cash-reserves',
                            label: 'Cash Reserves',
                            value: `$${cashReserves.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                            subValue: `${cashPercentage.toFixed(1)}% of total assets`,
                            icon: '🏦',
                            color: '#06b6d4'
                        },
                        {
                            id: 'capital-invested',
                            label: 'Capital Invested',
                            value: `$${totalInitialValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                            subValue: `Cost basis • ${((totalInitialValue / totalAssets) * 100).toFixed(1)}% of assets`,
                            icon: '💰',
                            color: '#8b5cf6'
                        },
                        {
                            id: 'total-returns',
                            label: 'Total Returns',
                            value: `${unrealizedPnL >= 0 ? '+' : ''}$${unrealizedPnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                            subValue: `${totalReturnPercent >= 0 ? '↑' : '↓'} ${Math.abs(totalReturnPercent).toFixed(2)}% all-time ROI`,
                            icon: unrealizedPnL >= 0 ? '🚀' : '📉',
                            color: unrealizedPnL >= 0 ? '#10b981' : '#ef4444'
                        },
                        {
                            id: 'daily-gain',
                            label: "Today's Gain",
                            value: `${dailyChange >= 0 ? '+' : ''}$${dailyChange.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                            subValue: `${dailyChangePercent >= 0 ? '↑' : '↓'} ${Math.abs(dailyChangePercent).toFixed(2)}% today`,
                            icon: dailyChange >= 0 ? '🔥' : '❄️',
                            color: dailyChange >= 0 ? '#10b981' : '#ef4444'
                        },
                    ];

                    return (
                        <div style={{ marginBottom: '32px' }}>
                            <DraggableDashboard cards={dashboardCards} />
                        </div>
                    );
                })()}

                {/* Performance Charts Section - 2 Column Layout */}
                <div style={{ marginBottom: '24px' }}>
                    <PortfolioPerformanceChart
                        totalValue={totalNotional}
                        assetClassPnL={Object.entries(groupedPositions).map(([assetClass, classPositions]) => {
                            const config = assetClassConfig[assetClass];
                            const sectionPnL = classPositions.reduce((sum, p) => sum + calculatePnL(p), 0);
                            return {
                                name: config?.label || assetClass,
                                pnl: sectionPnL,
                                color: config?.text || '#3b82f6'
                            };
                        }).filter(item => Math.abs(item.pnl) > 0)}
                    />
                </div>

                {/* AI Portfolio Chatbox + Broker Accounts - Side by Side */}
                <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
                    {/* AI Portfolio Chatbox - Left Side */}
                    <div style={{ flex: '1', minWidth: 0 }}>
                        <PortfolioChatbox
                            positions={positions.map(p => ({
                                symbol: p.symbol,
                                name: p.name || p.symbol,
                                quantity: p.quantity,
                                avgPrice: p.avgPrice,
                                currentPrice: p.currentPrice || p.avgPrice,
                                assetClass: p.assetClass || 'other',
                                positionType: p.positionType,
                                leverage: p.leverage
                            }))}
                            userName="Trader"
                            riskProfile="Moderate"
                            cashBalance={0}
                        />
                    </div>

                    {/* Broker Accounts Summary - Right Side */}
                    <div style={{ flex: '1', minWidth: 0 }}>
                        <div
                            onClick={() => setShowAccountsSection(!showAccountsSection)}
                            style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '12px 16px', backgroundColor: '#0d1f3c', borderRadius: '8px',
                                cursor: 'pointer', marginBottom: showAccountsSection ? '12px' : '0',
                                boxShadow: '0 0 20px #f59e0b22, inset 0 1px 0 #f59e0b11'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '16px', fontWeight: '600', color: '#fff' }}>🏦 Broker Accounts</span>
                                <span style={{ fontSize: '13px', color: '#64748b' }}>{brokerAccounts.length} account{brokerAccounts.length > 1 ? 's' : ''}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                                    Total: <span style={{ fontWeight: '600', color: '#fff' }}>${brokerAccounts.reduce((sum, a) => sum + a.totalBalance, 0).toLocaleString()}</span>
                                </span>
                                <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                                    Idle Cash: <span style={{ fontWeight: '600', color: '#f59e0b' }}>
                                        ${(() => {
                                            // Sum idle cash per broker (Total Balance - Active Positions for that broker)
                                            return brokerAccounts.reduce((totalIdle, account) => {
                                                const brokerPositions = positions.filter(p => p.broker === account.brokerName);
                                                const activeValue = brokerPositions.reduce((sum, p) => sum + calculateNotional(p), 0);
                                                const idleCash = Math.max(0, account.totalBalance - activeValue);
                                                return totalIdle + idleCash;
                                            }, 0).toLocaleString();
                                        })()}
                                    </span>
                                </span>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setEditingAccount(null); setShowAccountModal(true); }}
                                    style={{
                                        padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600',
                                        background: 'linear-gradient(135deg, #0ea5e9 0%, #22d3ee 100%)',
                                        color: '#fff', border: 'none', cursor: 'pointer'
                                    }}
                                >
                                    + Add Account
                                </button>
                                <span style={{ transform: showAccountsSection ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                            </div>
                        </div>

                        {showAccountsSection && (
                            <div style={{ backgroundColor: '#0d1f3c', borderRadius: '8px', padding: '12px', boxShadow: '0 0 15px #f59e0b15' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                    <thead>
                                        <tr style={{ color: '#64748b', fontSize: '11px' }}>
                                            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #1e3a5f33', fontWeight: '600' }}>BROKER</th>
                                            <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #1e3a5f33', fontWeight: '600' }}>TOTAL BALANCE</th>
                                            <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #1e3a5f33', fontWeight: '600' }}>ACTIVE POSITIONS</th>
                                            <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #1e3a5f33', fontWeight: '600' }}>IDLE CASH</th>
                                            <th style={{ textAlign: 'center', padding: '8px', borderBottom: '1px solid #1e3a5f33', fontWeight: '600' }}>SOURCE</th>
                                            <th style={{ textAlign: 'center', padding: '8px', borderBottom: '1px solid #1e3a5f33', fontWeight: '600' }}>UPDATED</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {brokerAccounts.map(account => {
                                            const brokerPositions = positions.filter(p => p.broker === account.brokerName);
                                            const activeValue = brokerPositions.reduce((sum, p) => sum + calculateNotional(p), 0);
                                            const idleCash = Math.max(0, account.totalBalance - activeValue);
                                            const idlePercent = account.totalBalance > 0 ? (idleCash / account.totalBalance * 100) : 0;

                                            return (
                                                <tr key={account.id} style={{ borderBottom: '1px solid #1e3a5f22' }}>
                                                    <td style={{ padding: '10px 8px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <span style={{ fontWeight: '600', color: '#fff' }}>{account.brokerName}</span>
                                                            {account.platform && <span style={{ fontSize: '11px', color: '#64748b' }}>({account.platform})</span>}
                                                        </div>
                                                    </td>
                                                    <td style={{ textAlign: 'right', padding: '10px 8px', fontWeight: '600', color: '#fff' }}>
                                                        ${account.totalBalance.toLocaleString()}
                                                    </td>
                                                    <td style={{ textAlign: 'right', padding: '10px 8px', color: '#22c55e' }}>
                                                        ${activeValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                                        <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '4px' }}>({brokerPositions.length} pos)</span>
                                                    </td>
                                                    <td style={{ textAlign: 'right', padding: '10px 8px' }}>
                                                        <span style={{ color: idleCash > 0 ? '#f59e0b' : '#64748b', fontWeight: '600' }}>
                                                            ${idleCash.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                                        </span>
                                                        <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '4px' }}>({idlePercent.toFixed(0)}%)</span>
                                                    </td>
                                                    <td style={{ textAlign: 'center', padding: '10px 8px' }}>
                                                        {account.verificationSource === 'api_linked' ? (
                                                            <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '600', backgroundColor: '#f59e0b22', color: '#f59e0b' }}>✓ API</span>
                                                        ) : account.verificationSource === 'ai_import' ? (
                                                            <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '600', backgroundColor: '#22c55e22', color: '#22c55e' }}>✓ AI</span>
                                                        ) : (
                                                            <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '600', backgroundColor: '#64748b22', color: '#94a3b8' }}>✎ Manual</span>
                                                        )}
                                                    </td>
                                                    <td style={{ textAlign: 'center', padding: '10px 8px', fontSize: '11px', color: '#64748b' }}>
                                                        {new Date(account.lastUpdated).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                <div className="portfolio-main-grid">
                    {/* Holdings - Left Side */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {Object.entries(groupedPositions).map(([assetClass, classPositions]) => {
                            const config = assetClassConfig[assetClass];
                            // Calculate section totals
                            const sectionInitialValue = classPositions.reduce((sum, p) => {
                                if (p.assetClass === 'forex' && p.lotSize !== undefined) {
                                    return sum + (p.lotSize * 100000 * p.avgPrice);
                                }
                                return sum + (p.avgPrice * p.quantity * (p.leverage || 1));
                            }, 0);
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
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '13px' }}>
                                            <span style={{ color: '#94a3b8' }}>Initial: <span style={{ fontWeight: '600', color: '#fff' }}>${sectionInitialValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></span>
                                            <span style={{ color: '#94a3b8' }}>Current: <span style={{ fontWeight: '600', color: '#fff' }}>${sectionNotional.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></span>
                                            <span style={{ color: '#94a3b8' }}>P&L: <span style={{ fontWeight: '600', color: sectionPnL >= 0 ? '#22c55e' : '#ef4444' }}>
                                                {sectionPnL >= 0 ? '+' : '-'}${Math.abs(sectionPnL).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span></span>
                                        </div>
                                    </div>

                                    {/* Position Table */}
                                    {isExpanded && (
                                        <div style={{ padding: '0 8px 12px', overflowX: 'auto' }}>
                                            <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                                                <thead>
                                                    <tr style={{ color: '#64748b', fontSize: '11px' }}>
                                                        <th style={{ width: '22%', textAlign: 'left', padding: '6px 2px', fontWeight: '600', borderBottom: '1px solid #1e3a5f33' }}>POSITION</th>
                                                        <th style={{ width: '8%', textAlign: 'right', padding: '6px 2px', fontWeight: '600', borderBottom: '1px solid #1e3a5f33' }}>QTY</th>
                                                        <th style={{ width: '10%', textAlign: 'right', padding: '6px 2px', fontWeight: '600', borderBottom: '1px solid #1e3a5f33' }}>ENTRY</th>
                                                        <th style={{ width: '10%', textAlign: 'right', padding: '6px 2px', fontWeight: '600', borderBottom: '1px solid #1e3a5f33' }}>CURRENT</th>
                                                        <th style={{ width: '10%', textAlign: 'right', padding: '6px 2px', fontWeight: '600', borderBottom: '1px solid #1e3a5f33' }}>COST</th>
                                                        <th style={{ width: '10%', textAlign: 'right', padding: '6px 2px', fontWeight: '600', borderBottom: '1px solid #1e3a5f33' }}>VALUE</th>
                                                        <th style={{ width: '10%', textAlign: 'right', padding: '6px 2px', fontWeight: '600', borderBottom: '1px solid #1e3a5f33' }}>P&L</th>
                                                        <th style={{ width: '10%', textAlign: 'center', padding: '6px 2px', fontWeight: '600', borderBottom: '1px solid #1e3a5f33' }}>BROKER</th>
                                                        <th style={{ width: '10%', textAlign: 'center', padding: '6px 2px', fontWeight: '600', borderBottom: '1px solid #1e3a5f33' }}>PLATFORM</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {classPositions.map(pos => {
                                                        const pnl = calculatePnL(pos);
                                                        const pnlPct = calculatePnLPercent(pos);
                                                        const notional = calculateNotional(pos);
                                                        const initialValue = pos.avgPrice * pos.quantity * (pos.leverage || 1);
                                                        const badge = getPositionBadge(pos, config);

                                                        return (
                                                            <tr key={pos.id} style={{ borderBottom: '1px solid #1e3a5f22' }}>
                                                                <td style={{ padding: '8px 2px' }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                        <div style={{
                                                                            width: '26px', height: '26px', borderRadius: '50%',
                                                                            backgroundColor: badge.bg, color: '#000',
                                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                            fontSize: '11px', fontWeight: 'bold', flexShrink: 0
                                                                        }}>
                                                                            {badge.letter}
                                                                        </div>
                                                                        <div style={{ minWidth: 0 }}>
                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                                                <span style={{ fontWeight: '600', color: '#fff', fontSize: '13px' }}>{pos.symbol}</span>
                                                                                {/* Verification Badge */}
                                                                                {pos.verificationSource === 'api_linked' ? (
                                                                                    <span
                                                                                        title="Synced directly from your broker - highest trust level"
                                                                                        style={{
                                                                                            padding: '2px 6px',
                                                                                            borderRadius: '4px',
                                                                                            fontSize: '9px',
                                                                                            fontWeight: '600',
                                                                                            backgroundColor: '#eab30833',
                                                                                            color: '#eab308',
                                                                                            cursor: 'help',
                                                                                            display: 'flex',
                                                                                            alignItems: 'center',
                                                                                            gap: '3px'
                                                                                        }}
                                                                                    >✓ API Verified</span>
                                                                                ) : pos.verificationSource === 'ai_import' ? (
                                                                                    <span
                                                                                        title={`Extracted by AI from screenshot${pos.verifiedAt ? ' on ' + new Date(pos.verifiedAt).toLocaleDateString() : ''}`}
                                                                                        style={{
                                                                                            padding: '2px 6px',
                                                                                            borderRadius: '4px',
                                                                                            fontSize: '9px',
                                                                                            fontWeight: '600',
                                                                                            backgroundColor: '#22c55e33',
                                                                                            color: '#22c55e',
                                                                                            cursor: 'help',
                                                                                            display: 'flex',
                                                                                            alignItems: 'center',
                                                                                            gap: '3px'
                                                                                        }}
                                                                                    >✓ AI Verified</span>
                                                                                ) : (
                                                                                    <span
                                                                                        title="Manually entered - not verified by external source"
                                                                                        style={{
                                                                                            padding: '2px 6px',
                                                                                            borderRadius: '4px',
                                                                                            fontSize: '9px',
                                                                                            fontWeight: '600',
                                                                                            backgroundColor: '#64748b33',
                                                                                            color: '#94a3b8',
                                                                                            cursor: 'help',
                                                                                            display: 'flex',
                                                                                            alignItems: 'center',
                                                                                            gap: '3px'
                                                                                        }}
                                                                                    >✎ Manual</span>
                                                                                )}
                                                                                {pos.positionType === 'perpetual' && (
                                                                                    <span style={{ padding: '1px 3px', borderRadius: '3px', fontSize: '9px', fontWeight: '600', backgroundColor: '#00d4ff22', color: '#00d4ff' }}>PERP</span>
                                                                                )}
                                                                                {pos.positionType === 'option' && (
                                                                                    <span style={{ padding: '1px 3px', borderRadius: '3px', fontSize: '9px', fontWeight: '600', backgroundColor: '#22c55e22', color: '#22c55e' }}>OPT</span>
                                                                                )}
                                                                            </div>
                                                                            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' }}>{pos.name}</span>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td style={{ textAlign: 'right', padding: '8px 2px' }}>
                                                                    {pos.assetClass === 'forex' && pos.lotSize !== undefined ? (
                                                                        <div>
                                                                            <span style={{ color: '#e2e8f0', fontSize: '13px' }}>{formatLotSize(pos.lotSize)}</span>
                                                                            <span style={{ display: 'block', fontSize: '10px', color: '#64748b' }}>
                                                                                {getForexPips(pos) >= 0 ? '+' : ''}{getForexPips(pos).toFixed(1)} pips
                                                                            </span>
                                                                        </div>
                                                                    ) : (
                                                                        <span style={{ color: '#e2e8f0', fontSize: '13px' }}>{pos.quantity}</span>
                                                                    )}
                                                                    {pos.leverage && pos.leverage > 1 && (
                                                                        <span style={{ marginLeft: '2px', padding: '1px 3px', borderRadius: '3px', fontSize: '9px', fontWeight: '600', backgroundColor: '#3b82f622', color: '#3b82f6' }}>{pos.leverage}x</span>
                                                                    )}
                                                                </td>
                                                                <td style={{ textAlign: 'right', padding: '8px 2px', color: '#94a3b8', fontSize: '13px' }}>${pos.avgPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                                <td style={{ textAlign: 'right', padding: '8px 2px', fontWeight: '600', color: '#fff', fontSize: '13px' }}>${pos.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                                <td style={{ textAlign: 'right', padding: '8px 2px', color: '#94a3b8', fontSize: '13px' }}>
                                                                    ${initialValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                                                </td>
                                                                <td style={{ textAlign: 'right', padding: '8px 2px', fontWeight: '600', color: '#fff', fontSize: '13px' }}>
                                                                    ${notional.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                                                </td>
                                                                <td style={{ textAlign: 'right', padding: '8px 2px' }}>
                                                                    <div style={{ color: pnl >= 0 ? '#22c55e' : '#ef4444', fontWeight: '600', fontSize: '13px' }}>
                                                                        {pnl >= 0 ? '+' : ''}${pnl.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                                                    </div>
                                                                    <div style={{ fontSize: '10px', color: pnl >= 0 ? '#22c55e99' : '#ef444499' }}>
                                                                        {pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(1)}%
                                                                    </div>
                                                                </td>
                                                                <td style={{ textAlign: 'center', padding: '8px 2px' }}>
                                                                    <span style={{ padding: '3px 6px', borderRadius: '4px', fontSize: '12px', fontWeight: '500', backgroundColor: '#3b82f633', color: '#fff' }}>
                                                                        {pos.broker || '—'}
                                                                    </span>
                                                                </td>
                                                                <td style={{ textAlign: 'center', padding: '8px 2px' }}>
                                                                    <span style={{ padding: '3px 6px', borderRadius: '4px', fontSize: '12px', fontWeight: '500', backgroundColor: '#a855f733', color: '#fff' }}>
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

            {/* Account Entry/Edit Modal */}
            {showAccountModal && (
                <div className="modal-overlay" onClick={() => setShowAccountModal(false)}>
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            backgroundColor: '#0d1f3c', borderRadius: '16px', padding: '24px',
                            width: '450px', maxWidth: '90vw', boxShadow: '0 0 30px #f59e0b22'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ color: '#fff', margin: 0, fontSize: '18px' }}>
                                {editingAccount ? 'Edit Broker Account' : 'Add Broker Account'}
                            </h2>
                            <button onClick={() => setShowAccountModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '24px', cursor: 'pointer' }}>×</button>
                        </div>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const form = e.target as HTMLFormElement;
                            const formData = new FormData(form);
                            const newAccount: BrokerAccount = {
                                id: editingAccount?.id || `ba-${Date.now()}`,
                                brokerName: formData.get('brokerName') as string,
                                platform: formData.get('platform') as string || undefined,
                                totalBalance: parseFloat(formData.get('totalBalance') as string) || 0,
                                currency: formData.get('currency') as string || 'USD',
                                lastUpdated: new Date().toISOString(),
                                verificationSource: formData.get('verificationSource') as 'manual' | 'api_linked' | 'ai_import'
                            };

                            if (editingAccount) {
                                setBrokerAccounts(prev => prev.map(a => a.id === editingAccount.id ? newAccount : a));
                            } else {
                                setBrokerAccounts(prev => [...prev, newAccount]);
                            }
                            setShowAccountModal(false);
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Broker Name *</label>
                                    <input
                                        name="brokerName"
                                        type="text"
                                        defaultValue={editingAccount?.brokerName || ''}
                                        required
                                        placeholder="e.g., Binance, IBKR, OANDA"
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #1e3a5f', backgroundColor: '#0a1628', color: '#fff', fontSize: '14px' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Platform (optional)</label>
                                    <input
                                        name="platform"
                                        type="text"
                                        defaultValue={editingAccount?.platform || ''}
                                        placeholder="e.g., MT5, TradingView, Mobile App"
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #1e3a5f', backgroundColor: '#0a1628', color: '#fff', fontSize: '14px' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{ flex: 2 }}>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Total Balance *</label>
                                        <input
                                            name="totalBalance"
                                            type="number"
                                            step="0.01"
                                            defaultValue={editingAccount?.totalBalance || ''}
                                            required
                                            placeholder="0.00"
                                            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #1e3a5f', backgroundColor: '#0a1628', color: '#fff', fontSize: '14px' }}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Currency</label>
                                        <select
                                            name="currency"
                                            defaultValue={editingAccount?.currency || 'USD'}
                                            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #1e3a5f', backgroundColor: '#0a1628', color: '#fff', fontSize: '14px' }}
                                        >
                                            <option value="USD">USD</option>
                                            <option value="USDT">USDT</option>
                                            <option value="EUR">EUR</option>
                                            <option value="GBP">GBP</option>
                                            <option value="SGD">SGD</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Data Source</label>
                                    <select
                                        name="verificationSource"
                                        defaultValue={editingAccount?.verificationSource || 'manual'}
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #1e3a5f', backgroundColor: '#0a1628', color: '#fff', fontSize: '14px' }}
                                    >
                                        <option value="manual">✎ Manual Entry</option>
                                        <option value="ai_import">✓ AI Import (from screenshot)</option>
                                        <option value="api_linked">✓ API Linked</option>
                                    </select>
                                </div>

                                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setShowAccountModal(false)}
                                        style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #1e3a5f', backgroundColor: 'transparent', color: '#94a3b8', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #0ea5e9 0%, #22d3ee 100%)', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                                    >
                                        {editingAccount ? 'Update Account' : 'Add Account'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
                                <div style={{ position: 'relative' }}>
                                    <label style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Symbol * (Search or type)</label>
                                    <input
                                        ref={symbolInputRef}
                                        value={manualPosition.symbol}
                                        onChange={e => updateManualPosition('symbol', e.target.value)}
                                        onFocus={() => {
                                            if (manualPosition.symbol.length > 0) {
                                                const suggestions = searchAssets(manualPosition.symbol, manualPosition.assetClass !== 'other' ? manualPosition.assetClass : undefined);
                                                setSymbolSuggestions(suggestions);
                                                setShowSymbolSuggestions(suggestions.length > 0);
                                            }
                                        }}
                                        onBlur={() => {
                                            // Delay to allow click on suggestion
                                            setTimeout(() => setShowSymbolSuggestions(false), 200);
                                        }}
                                        placeholder="Type to search AAPL, BTC, EUR..."
                                        autoComplete="off"
                                        style={{ padding: '10px', borderRadius: '6px', fontSize: '14px', backgroundColor: '#0a1628', color: '#fff', border: '1px solid #3f4f66', width: '100%', fontWeight: '600' }}
                                    />
                                    {/* Autocomplete Suggestions Dropdown */}
                                    {showSymbolSuggestions && symbolSuggestions.length > 0 && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: 0,
                                            right: 0,
                                            backgroundColor: '#0d1f3c',
                                            border: '1px solid #3f4f66',
                                            borderRadius: '6px',
                                            marginTop: '4px',
                                            maxHeight: '200px',
                                            overflowY: 'auto',
                                            zIndex: 100,
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                                        }}>
                                            {symbolSuggestions.map((asset, idx) => (
                                                <div
                                                    key={`${asset.symbol}-${idx}`}
                                                    onClick={() => selectAssetSuggestion(asset)}
                                                    style={{
                                                        padding: '10px 12px',
                                                        cursor: 'pointer',
                                                        borderBottom: idx < symbolSuggestions.length - 1 ? '1px solid #1e3a5f' : 'none',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e3a5f'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                >
                                                    <div>
                                                        <span style={{ fontWeight: '600', color: '#fff' }}>{asset.symbol}</span>
                                                        <span style={{ marginLeft: '8px', color: '#94a3b8', fontSize: '12px' }}>{asset.name}</span>
                                                    </div>
                                                    <span style={{
                                                        fontSize: '10px',
                                                        padding: '2px 6px',
                                                        borderRadius: '4px',
                                                        backgroundColor: asset.assetClass === 'stock' ? '#3b82f622' :
                                                            asset.assetClass === 'crypto' ? '#f59e0b22' :
                                                                asset.assetClass === 'forex' ? '#10b98122' :
                                                                    asset.assetClass === 'etf' ? '#ec489922' : '#a855f722',
                                                        color: asset.assetClass === 'stock' ? '#3b82f6' :
                                                            asset.assetClass === 'crypto' ? '#f59e0b' :
                                                                asset.assetClass === 'forex' ? '#10b981' :
                                                                    asset.assetClass === 'etf' ? '#ec4899' : '#a855f7'
                                                    }}>
                                                        {asset.assetClass}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
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

                            {/* Row 3: Quantity, Entry Price */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
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
                            </div>

                            {/* Row 4: Current Price (optional) */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Current Price (optional - leave blank to auto-fetch)</label>
                                <input
                                    type="number"
                                    value={manualPosition.currentPrice}
                                    onChange={e => updateManualPosition('currentPrice', e.target.value)}
                                    placeholder="Auto-fetch from market"
                                    style={{ padding: '10px', borderRadius: '6px', fontSize: '14px', backgroundColor: '#0a1628', color: '#fff', border: '1px solid #3f4f66', width: '100%', textAlign: 'right' }}
                                />
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
