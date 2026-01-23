'use client';

import React, { useState, useEffect } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    Legend,
} from 'recharts';

interface PerformanceDataPoint {
    date: string;
    value: number;
    pnl: number;
}

interface AssetClassPnL {
    name: string;
    pnl: number;
    color: string;
}

// Generate realistic mock performance data
const generatePerformanceData = (days: number, currentValue: number): PerformanceDataPoint[] => {
    const data: PerformanceDataPoint[] = [];
    const today = new Date();
    let value = currentValue * 0.85; // Start at 85% of current value

    for (let i = days; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        // Add some realistic volatility
        const dailyChange = (Math.random() - 0.45) * 0.03; // Slight upward bias
        value = value * (1 + dailyChange);

        // Ensure we end close to current value
        if (i === 0) value = currentValue;

        data.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: Math.round(value * 100) / 100,
            pnl: Math.round((value - currentValue * 0.85) * 100) / 100,
        });
    }

    return data;
};

// Custom tooltip for the area chart
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const value = payload[0].value;
        const isPositive = payload[0].payload.pnl >= 0;
        return (
            <div style={{
                backgroundColor: '#0A0A0A',
                border: '1px solid #333',
                borderRadius: '8px',
                padding: '12px 16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}>
                <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>{label}</p>
                <p style={{ color: '#fff', fontSize: '16px', fontWeight: '600' }}>
                    ${value.toLocaleString()}
                </p>
                <p style={{
                    color: isPositive ? '#22c55e' : '#ef4444',
                    fontSize: '12px',
                    marginTop: '4px'
                }}>
                    {isPositive ? '+' : ''}{payload[0].payload.pnl.toLocaleString()} P/L
                </p>
            </div>
        );
    }
    return null;
};

// Custom tooltip for bar chart
const BarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const value = payload[0].value;
        const isPositive = value >= 0;
        return (
            <div style={{
                backgroundColor: '#0A0A0A',
                border: '1px solid #333',
                borderRadius: '8px',
                padding: '12px 16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}>
                <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>{label}</p>
                <p style={{
                    color: isPositive ? '#22c55e' : '#ef4444',
                    fontSize: '16px',
                    fontWeight: '600'
                }}>
                    {isPositive ? '+' : ''}${Math.abs(value).toLocaleString()}
                </p>
            </div>
        );
    }
    return null;
};

interface PortfolioChartsProps {
    totalValue: number;
    assetClassPnL: AssetClassPnL[];
}

export function PortfolioPerformanceChart({ totalValue, assetClassPnL }: PortfolioChartsProps) {
    const [performanceData, setPerformanceData] = useState<PerformanceDataPoint[]>([]);
    const [timeRange, setTimeRange] = useState<'1W' | '1M' | '3M' | '1Y'>('1M');
    const [isAnimating, setIsAnimating] = useState(true);

    useEffect(() => {
        const days = timeRange === '1W' ? 7 : timeRange === '1M' ? 30 : timeRange === '3M' ? 90 : 365;
        setPerformanceData(generatePerformanceData(days, totalValue));
        setIsAnimating(true);
        const timer = setTimeout(() => setIsAnimating(false), 2000);
        return () => clearTimeout(timer);
    }, [totalValue, timeRange]);

    const minValue = Math.min(...performanceData.map(d => d.value)) * 0.98;
    const maxValue = Math.max(...performanceData.map(d => d.value)) * 1.02;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Portfolio Performance Area Chart */}
            <div className="section-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', marginBottom: '4px' }}>
                            📈 Portfolio Performance
                        </h3>
                        <p style={{ fontSize: '11px', color: '#64748b' }}>
                            Track your portfolio value over time
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        {(['1W', '1M', '3M', '1Y'] as const).map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                style={{
                                    padding: '4px 10px',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    fontWeight: '500',
                                    border: 'none',
                                    cursor: 'pointer',
                                    backgroundColor: timeRange === range ? '#D4AF37' : '#171717',
                                    color: timeRange === range ? '#000000' : '#9ca3af',
                                    transition: 'all 0.2s',
                                }}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ height: '220px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.4} />
                                    <stop offset="50%" stopColor="#D4AF37" stopOpacity={0.15} />
                                    <stop offset="100%" stopColor="#D4AF37" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#D4AF37" />
                                    <stop offset="50%" stopColor="#F59E0B" />
                                    <stop offset="100%" stopColor="#D4AF37" />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis
                                dataKey="date"
                                tick={{ fill: '#9ca3af', fontSize: 10 }}
                                axisLine={{ stroke: '#333' }}
                                tickLine={false}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                domain={[minValue, maxValue]}
                                tick={{ fill: '#64748b', fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                                width={45}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="url(#lineGradient)"
                                strokeWidth={3}
                                fill="url(#portfolioGradient)"
                                animationDuration={isAnimating ? 2000 : 0}
                                animationEasing="ease-out"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* P/L by Asset Class Bar Chart */}
            <div className="section-card" style={{ padding: '20px' }}>
                <div style={{ marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', marginBottom: '4px' }}>
                        📊 Profit/Loss by Asset Class
                    </h3>
                    <p style={{ fontSize: '11px', color: '#64748b' }}>
                        See which asset classes are performing best
                    </p>
                </div>

                <div style={{ height: '220px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={assetClassPnL} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                            <XAxis
                                type="number"
                                tick={{ fill: '#9ca3af', fontSize: 10 }}
                                axisLine={{ stroke: '#333' }}
                                tickLine={false}
                                tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
                            />
                            <YAxis
                                type="category"
                                dataKey="name"
                                tick={{ fill: '#94a3b8', fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                                width={105}
                            />
                            <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                            <Bar
                                dataKey="pnl"
                                radius={[0, 4, 4, 0]}
                                animationDuration={1500}
                            >
                                {assetClassPnL.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.pnl >= 0 ? '#22c55e' : '#ef4444'}
                                        opacity={0.85}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

// Animated counter component for impressive number animations
interface AnimatedValueProps {
    value: number;
    prefix?: string;
    suffix?: string;
    decimals?: number;
    duration?: number;
    className?: string;
    style?: React.CSSProperties;
}

export function AnimatedValue({
    value,
    prefix = '',
    suffix = '',
    decimals = 2,
    duration = 1500,
    className,
    style
}: AnimatedValueProps) {
    const [displayValue, setDisplayValue] = useState(0);
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
        if (hasAnimated) {
            setDisplayValue(value);
            return;
        }

        let startTime: number;
        let animationFrame: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);

            // Easing function (ease-out-expo)
            const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

            setDisplayValue(value * easeOutExpo);

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            } else {
                setHasAnimated(true);
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => {
            if (animationFrame) cancelAnimationFrame(animationFrame);
        };
    }, [value, duration, hasAnimated]);

    return (
        <span className={className} style={style}>
            {prefix}{displayValue.toLocaleString(undefined, {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            })}{suffix}
        </span>
    );
}

// Mini sparkline for position rows
interface SparklineProps {
    data: number[];
    width?: number;
    height?: number;
    color?: string;
}

export function Sparkline({ data, width = 60, height = 20, color }: SparklineProps) {
    if (!data || data.length < 2) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const sparkColor = color || (data[data.length - 1] >= data[0] ? '#22c55e' : '#ef4444');

    const points = data.map((value, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((value - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={width} height={height} style={{ overflow: 'visible' }}>
            <polyline
                points={points}
                fill="none"
                stroke={sparkColor}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* End dot */}
            <circle
                cx={width}
                cy={height - ((data[data.length - 1] - min) / range) * height}
                r="2"
                fill={sparkColor}
            />
        </svg>
    );
}

// Generate mock sparkline data
export function generateSparklineData(trend: 'up' | 'down' | 'volatile', points: number = 12): number[] {
    const data: number[] = [100];

    for (let i = 1; i < points; i++) {
        let change: number;
        if (trend === 'up') {
            change = (Math.random() - 0.3) * 5;
        } else if (trend === 'down') {
            change = (Math.random() - 0.7) * 5;
        } else {
            change = (Math.random() - 0.5) * 8;
        }
        data.push(data[i - 1] + change);
    }

    return data;
}
