'use client';

import React, { useEffect, useState, useRef } from 'react';
import { PortfolioAnalysisReport, portfolioAnalystAPI, AnalysisPosition } from '@/lib/api';

interface AIPortfolioAnalystProps {
    id?: string;
    positions: AnalysisPosition[];
    focusedPosition?: AnalysisPosition | null;
    onAnalysisComplete?: (report: PortfolioAnalysisReport) => void;
}

export function AIPortfolioAnalyst({ id, positions, focusedPosition, onAnalysisComplete }: AIPortfolioAnalystProps) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [report, setReport] = useState<PortfolioAnalysisReport | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const hasAnalyzed = useRef(false);

    // Auto-analyze on first load or when focused position changes
    useEffect(() => {
        if (positions.length > 0 && !hasAnalyzed.current && !isAnalyzing && !report) {
            hasAnalyzed.current = true;
            runAnalysis(positions);
        }
    }, [positions]);

    useEffect(() => {
        if (focusedPosition) {
            runAnalysis([focusedPosition]);
        }
    }, [focusedPosition]);

    // Generate a fallback mock analysis based on portfolio data
    const generateMockAnalysis = (positions: AnalysisPosition[]): PortfolioAnalysisReport => {
        const totalValue = positions.reduce((sum, p) => sum + (p.currentPrice * p.quantity), 0);
        const totalPnL = positions.reduce((sum, p) => sum + ((p.currentPrice - p.avgPrice) * p.quantity), 0);
        const pnlPercent = totalValue > 0 ? (totalPnL / (totalValue - totalPnL)) * 100 : 0;

        // Identify risk alerts
        const riskAlerts: { symbol: string; level: 'low' | 'medium' | 'high' | 'critical'; reason: string; suggestion?: string }[] = [];

        positions.forEach(p => {
            const positionValue = p.currentPrice * p.quantity;
            const concentration = (positionValue / totalValue) * 100;
            const positionPnlPct = ((p.currentPrice - p.avgPrice) / p.avgPrice) * 100;

            if (concentration > 30) {
                riskAlerts.push({
                    symbol: p.symbol,
                    level: concentration > 50 ? 'critical' : 'high',
                    reason: `Position represents ${concentration.toFixed(1)}% of portfolio`,
                    suggestion: 'Consider reducing exposure to improve diversification'
                });
            }

            if (positionPnlPct < -15) {
                riskAlerts.push({
                    symbol: p.symbol,
                    level: positionPnlPct < -30 ? 'critical' : 'high',
                    reason: `Position is down ${Math.abs(positionPnlPct).toFixed(1)}%`,
                    suggestion: 'Review thesis or consider stop-loss'
                });
            }

            if (p.leverage && p.leverage > 10) {
                riskAlerts.push({
                    symbol: p.symbol,
                    level: 'high',
                    reason: `High leverage (${p.leverage}x) increases risk`,
                    suggestion: 'Monitor closely and consider reducing leverage'
                });
            }
        });

        // Generate summary
        const topHoldings = positions
            .map(p => ({ ...p, value: p.currentPrice * p.quantity }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 3);

        const score = Math.max(30, Math.min(95, 70 - riskAlerts.filter(r => r.level === 'critical').length * 15 - riskAlerts.filter(r => r.level === 'high').length * 8 + (pnlPercent > 0 ? 10 : -5)));

        let scoreLabel: 'Poor' | 'Fair' | 'Good' | 'Excellent' = 'Fair';
        if (score >= 80) scoreLabel = 'Excellent';
        else if (score >= 65) scoreLabel = 'Good';
        else if (score < 45) scoreLabel = 'Poor';

        const summary = `Your portfolio of ${positions.length} positions has a total value of $${totalValue.toLocaleString()} with ${pnlPercent >= 0 ? 'gains' : 'losses'} of ${Math.abs(pnlPercent).toFixed(1)}%. ` +
            `Top holdings: ${topHoldings.map(h => h.symbol).join(', ')}. ` +
            (riskAlerts.length > 0 ? `⚠️ Found ${riskAlerts.length} risk alerts that need attention.` : '✅ No critical risk alerts detected.');

        return {
            overallScore: score,
            scoreLabel,
            riskAlerts,
            newsAlerts: [],
            overtradingWarnings: [],
            recommendations: [
                pnlPercent > 10 ? 'Consider taking some profits on winning positions' : 'Maintain current positions and monitor for opportunities',
                riskAlerts.length > 0 ? 'Address the risk alerts to improve portfolio health' : 'Continue with current strategy',
                positions.length < 5 ? 'Consider adding more positions for better diversification' : 'Portfolio is reasonably diversified'
            ],
            summary,
            generatedAt: new Date().toISOString()
        };
    };

    const runAnalysis = async (positionsToAnalyze: AnalysisPosition[] = positions) => {
        if (isAnalyzing || positionsToAnalyze.length === 0) return;

        setIsAnalyzing(true);
        setError(null);
        setDisplayedText('');
        setIsTyping(true);

        // Simulate typing effect while waiting
        const thinkingMessages = [
            "Analyzing your portfolio...",
            "Checking position concentrations...",
            "Evaluating risk levels...",
            "Generating insights..."
        ];
        let msgIndex = 0;
        const typingInterval = setInterval(() => {
            setDisplayedText(thinkingMessages[msgIndex % thinkingMessages.length]);
            msgIndex++;
        }, 800);

        // Set a timeout to prevent infinite analyzing
        const timeoutId = setTimeout(() => {
            clearInterval(typingInterval);
            // Use mock analysis on timeout
            console.log('[AIAnalyst] Timeout - using fallback analysis');
            const mockData = generateMockAnalysis(positions);
            setReport(mockData);
            onAnalysisComplete?.(mockData);
            setDisplayedText(mockData.summary);
            setIsTyping(false);
            setIsAnalyzing(false);
        }, 15000); // 15 second timeout before fallback

        try {
            console.log('[AIAnalyst] Starting analysis with items:', positionsToAnalyze.length);
            const response = await portfolioAnalystAPI.analyze(positionsToAnalyze);

            clearTimeout(timeoutId);
            clearInterval(typingInterval);

            console.log('[AIAnalyst] Analysis complete:', response.data);
            const data = response.data;
            setReport(data);
            onAnalysisComplete?.(data);

            // Type out the summary with animation
            setDisplayedText('');
            const fullText = data.summary || 'Analysis complete.';
            for (let i = 0; i <= fullText.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 15));
                setDisplayedText(fullText.substring(0, i));
            }
            setIsTyping(false);
        } catch (err: any) {
            clearTimeout(timeoutId);
            clearInterval(typingInterval);

            console.error('[AIAnalyst] API failed, using fallback analysis:', err);

            // Use mock analysis on error
            const mockData = generateMockAnalysis(positionsToAnalyze);
            setReport(mockData);
            onAnalysisComplete?.(mockData);

            // Type out the mock summary
            setDisplayedText('');
            const fullText = mockData.summary;
            for (let i = 0; i <= fullText.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 15));
                setDisplayedText(fullText.substring(0, i));
            }
            setIsTyping(false);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 70) return '#22c55e';
        if (score >= 50) return '#eab308';
        return '#ef4444';
    };

    return (
        <div id={id} style={{
            background: 'linear-gradient(135deg, #0d1f3c 0%, #1a365d 50%, #0d1f3c 100%)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 4px 30px rgba(0,212,255,0.1)',
            border: '1px solid #1e3a5f'
        }}>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                {/* Robot Avatar with Animation */}
                <div style={{ flexShrink: 0, position: 'relative' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #00d4ff 0%, #3b82f6 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 30px rgba(0,212,255,0.4)',
                        animation: 'robotPulse 2s ease-in-out infinite'
                    }}>
                        <span style={{ fontSize: '36px' }}>🤖</span>
                    </div>
                    {/* Animated rings */}
                    {isAnalyzing && (
                        <>
                            <div style={{
                                position: 'absolute',
                                top: '-10px',
                                left: '-10px',
                                width: '100px',
                                height: '100px',
                                borderRadius: '50%',
                                border: '2px solid rgba(0,212,255,0.3)',
                                animation: 'robotRing 1.5s ease-out infinite'
                            }} />
                            <div style={{
                                position: 'absolute',
                                top: '-10px',
                                left: '-10px',
                                width: '100px',
                                height: '100px',
                                borderRadius: '50%',
                                border: '2px solid rgba(0,212,255,0.3)',
                                animation: 'robotRing 1.5s ease-out infinite 0.5s'
                            }} />
                        </>
                    )}
                </div>

                {/* Chat Bubble */}
                <div style={{ flex: 1, position: 'relative' }}>
                    {/* Bubble arrow */}
                    <div style={{
                        position: 'absolute',
                        left: '-10px',
                        top: '20px',
                        width: 0,
                        height: 0,
                        borderTop: '10px solid transparent',
                        borderBottom: '10px solid transparent',
                        borderRight: '10px solid #0f2847'
                    }} />

                    {/* Main bubble */}
                    <div style={{
                        backgroundColor: '#0f2847',
                        borderRadius: '16px',
                        padding: '20px',
                        minHeight: '100px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <span style={{ fontSize: '18px', fontWeight: '600', color: '#00d4ff' }}>
                                {focusedPosition ? `Focused Analysis: ${focusedPosition.symbol}` : 'AI Portfolio Analyst'}
                            </span>
                            {report && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    backgroundColor: `${getScoreColor(report.overallScore)}22`,
                                    border: `1px solid ${getScoreColor(report.overallScore)}44`
                                }}>
                                    <span style={{ fontSize: '14px', fontWeight: '700', color: getScoreColor(report.overallScore) }}>
                                        {report.overallScore}
                                    </span>
                                    <span style={{ fontSize: '12px', color: getScoreColor(report.overallScore) }}>
                                        {report.scoreLabel}
                                    </span>
                                </div>
                            )}
                            {isAnalyzing && (
                                <span style={{
                                    fontSize: '12px',
                                    color: '#00d4ff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}>
                                    <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚙️</span>
                                    Thinking...
                                </span>
                            )}
                        </div>

                        {/* Message content */}
                        <div style={{ fontSize: '14px', color: '#e2e8f0', lineHeight: '1.6' }}>
                            {displayedText}
                            {isTyping && (
                                <span style={{
                                    display: 'inline-block',
                                    width: '8px',
                                    height: '16px',
                                    backgroundColor: '#00d4ff',
                                    marginLeft: '2px',
                                    animation: 'blink 0.7s infinite'
                                }} />
                            )}
                            {!displayedText && !isAnalyzing && positions.length === 0 && (
                                <span style={{ color: '#64748b' }}>Add some positions to get AI-powered insights!</span>
                            )}
                        </div>

                        {/* Quick insights cards */}
                        {report && !isTyping && (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '12px',
                                marginTop: '16px'
                            }}>
                                {report.riskAlerts.length > 0 && (
                                    <div style={{
                                        padding: '12px',
                                        borderRadius: '10px',
                                        backgroundColor: 'rgba(239,68,68,0.1)',
                                        border: '1px solid rgba(239,68,68,0.3)'
                                    }}>
                                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#ef4444', marginBottom: '6px' }}>
                                            ⚠️ {report.riskAlerts.length} Risk Alert{report.riskAlerts.length > 1 ? 's' : ''}
                                        </div>
                                        {report.riskAlerts.slice(0, 2).map((alert, i) => (
                                            <div key={i} style={{ fontSize: '11px', color: '#fca5a5', marginBottom: '4px' }}>
                                                <strong>{alert.symbol}:</strong> {alert.reason.substring(0, 50)}...
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {report.recommendations.length > 0 && (
                                    <div style={{
                                        padding: '12px',
                                        borderRadius: '10px',
                                        backgroundColor: 'rgba(34,197,94,0.1)',
                                        border: '1px solid rgba(34,197,94,0.3)'
                                    }}>
                                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#22c55e', marginBottom: '6px' }}>
                                            💡 Top Recommendations
                                        </div>
                                        {report.recommendations.slice(0, 2).map((rec, i) => (
                                            <div key={i} style={{ fontSize: '11px', color: '#86efac', marginBottom: '4px' }}>
                                                • {rec.substring(0, 60)}...
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {report.newsAlerts.length > 0 && (
                                    <div style={{
                                        padding: '12px',
                                        borderRadius: '10px',
                                        backgroundColor: 'rgba(59,130,246,0.1)',
                                        border: '1px solid rgba(59,130,246,0.3)'
                                    }}>
                                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#3b82f6', marginBottom: '6px' }}>
                                            📰 {report.newsAlerts.length} News Alert{report.newsAlerts.length > 1 ? 's' : ''}
                                        </div>
                                        {report.newsAlerts.slice(0, 2).map((news, i) => (
                                            <div key={i} style={{ fontSize: '11px', color: '#93c5fd', marginBottom: '4px' }}>
                                                <strong>{news.symbol}:</strong> {news.headline.substring(0, 40)}...
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Refresh button */}
                        {report && !isAnalyzing && (
                            <div style={{ marginTop: '16px', borderTop: '1px solid #1e3a5f', paddingTop: '12px' }}>
                                <button
                                    onClick={() => runAnalysis()}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                        backgroundColor: 'transparent',
                                        border: '1px solid #3b82f6',
                                        color: '#3b82f6',
                                        fontSize: '12px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    🔄 Refresh Analysis
                                </button>
                                <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '12px' }}>
                                    Last updated: {new Date(report.generatedAt).toLocaleTimeString()}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* CSS Animations */}
            <style jsx>{`
                @keyframes robotPulse {
                    0%, 100% { transform: scale(1); box-shadow: 0 0 30px rgba(0,212,255,0.4); }
                    50% { transform: scale(1.05); box-shadow: 0 0 50px rgba(0,212,255,0.6); }
                }
                @keyframes robotRing {
                    0% { transform: scale(1); opacity: 0.6; }
                    100% { transform: scale(1.5); opacity: 0; }
                }
                @keyframes blink {
                    0%, 50% { opacity: 1; }
                    51%, 100% { opacity: 0; }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

export default AIPortfolioAnalyst;
