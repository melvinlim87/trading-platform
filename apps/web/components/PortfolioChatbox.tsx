'use client';

import React, { useState, useRef, useEffect } from 'react';
import { portfolioChatAPI, ChatMessage, RawPosition } from '@/lib/api';

interface PortfolioChatboxProps {
    positions: RawPosition[];
    userName?: string;
    riskProfile?: 'Conservative' | 'Moderate' | 'Aggressive';
    cashBalance?: number;
}

export function PortfolioChatbox({
    positions,
    userName = 'Trader',
    riskProfile = 'Moderate',
    cashBalance = 0
}: PortfolioChatboxProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage = inputValue.trim();
        setInputValue('');

        // Add user message
        const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userMessage }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            const response = await portfolioChatAPI.chat({
                message: userMessage,
                positions,
                userName,
                riskProfile,
                cashBalance,
                conversationHistory: messages
            });
            setMessages([...newMessages, { role: 'assistant', content: response.data.response }]);
        } catch (error: any) {
            console.error('Chat error:', error);
            setMessages([...newMessages, {
                role: 'assistant',
                content: '❌ Sorry, I encountered an error connecting to the AI. Please try again.'
            }]);
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Direct send for quick action buttons
    const sendMessageDirect = async (message: string) => {
        if (isLoading) return;

        // Add user message
        const newMessages: ChatMessage[] = [...messages, { role: 'user', content: message }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            const response = await portfolioChatAPI.chat({
                message,
                positions,
                userName,
                riskProfile,
                cashBalance,
                conversationHistory: messages
            });
            setMessages([...newMessages, { role: 'assistant', content: response.data.response }]);
        } catch (error: any) {
            console.error('Chat error:', error);
            setMessages([...newMessages, {
                role: 'assistant',
                content: '❌ Sorry, I encountered an error connecting to the AI. Please try again.'
            }]);
        } finally {
            setIsLoading(false);
            setInputValue('');
        }
    };

    return (
        <div className="section-card" style={{
            backgroundColor: '#0d1f3c',
            borderRadius: '12px',
            border: '1px solid #1e3a5f',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 20px',
                    cursor: 'pointer',
                    borderBottom: isExpanded ? '1px solid #1e3a5f' : 'none',
                    background: 'linear-gradient(135deg, #1e3a5f22, #3b82f622)'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>🤖</span>
                    <div>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', margin: 0 }}>
                            AI Portfolio Mentor
                        </h3>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                            Ask about your positions, P&L, or allocation
                        </p>
                    </div>
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    backgroundColor: '#22c55e22',
                    border: '1px solid #22c55e44'
                }}>
                    <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#22c55e',
                        animation: 'pulse 2s infinite'
                    }}></div>
                    <span style={{ fontSize: '11px', color: '#22c55e', fontWeight: '500' }}>Qwen AI</span>
                </div>
                <span style={{
                    fontSize: '20px',
                    color: '#64748b',
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s'
                }}>▼</span>
            </div>

            {isExpanded && (
                <>
                    {/* Messages Area */}
                    <div style={{
                        height: '280px',
                        overflowY: 'auto',
                        padding: '16px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                    }}>
                        {messages.length === 0 ? (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                padding: '8px 0',
                                height: '100%',
                                overflowY: 'auto'
                            }}>
                                <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '12px', textAlign: 'center' }}>
                                    💬 Quick questions about your {positions.length} positions:
                                </p>

                                {/* Performance Questions */}
                                <div style={{ marginBottom: '12px' }}>
                                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px', fontWeight: '600' }}>
                                        📈 PERFORMANCE
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {[
                                            { icon: '📊', text: "Why am I up/down today?" },
                                            { icon: '🏆', text: "What's my best performing position?" },
                                            { icon: '📉', text: "Which position is losing the most?" },
                                            { icon: '💵', text: "What's my total P&L?" },
                                        ].map((q, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    setInputValue(q.text);
                                                    sendMessageDirect(q.text);
                                                }}
                                                style={{
                                                    padding: '6px 10px',
                                                    borderRadius: '16px',
                                                    fontSize: '11px',
                                                    backgroundColor: '#1e3a5f',
                                                    color: '#e2e8f0',
                                                    border: '1px solid #3f4f66',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#10b981';
                                                    e.currentTarget.style.borderColor = '#10b981';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#1e3a5f';
                                                    e.currentTarget.style.borderColor = '#3f4f66';
                                                }}
                                            >
                                                <span>{q.icon}</span> {q.text}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Risk & Allocation */}
                                <div style={{ marginBottom: '12px' }}>
                                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px', fontWeight: '600' }}>
                                        ⚖️ RISK & ALLOCATION
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {[
                                            { icon: '🎯', text: "How diversified is my portfolio?" },
                                            { icon: '⚠️', text: "Am I taking too much risk?" },
                                            { icon: '🔄', text: "Should I rebalance?" },
                                            { icon: '📊', text: "What's my asset allocation?" },
                                        ].map((q, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    setInputValue(q.text);
                                                    sendMessageDirect(q.text);
                                                }}
                                                style={{
                                                    padding: '6px 10px',
                                                    borderRadius: '16px',
                                                    fontSize: '11px',
                                                    backgroundColor: '#1e3a5f',
                                                    color: '#e2e8f0',
                                                    border: '1px solid #3f4f66',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#f59e0b';
                                                    e.currentTarget.style.borderColor = '#f59e0b';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#1e3a5f';
                                                    e.currentTarget.style.borderColor = '#3f4f66';
                                                }}
                                            >
                                                <span>{q.icon}</span> {q.text}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Trading Decisions */}
                                <div style={{ marginBottom: '12px' }}>
                                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px', fontWeight: '600' }}>
                                        💡 TRADING DECISIONS
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {[
                                            { icon: '🛒', text: "Can I buy more crypto?" },
                                            { icon: '💰', text: "Do I have enough cash to invest?" },
                                            { icon: '📈', text: "What should I buy next?" },
                                            { icon: '🚨', text: "Should I take profits on any position?" },
                                        ].map((q, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    setInputValue(q.text);
                                                    sendMessageDirect(q.text);
                                                }}
                                                style={{
                                                    padding: '6px 10px',
                                                    borderRadius: '16px',
                                                    fontSize: '11px',
                                                    backgroundColor: '#1e3a5f',
                                                    color: '#e2e8f0',
                                                    border: '1px solid #3f4f66',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#3b82f6';
                                                    e.currentTarget.style.borderColor = '#3b82f6';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#1e3a5f';
                                                    e.currentTarget.style.borderColor = '#3f4f66';
                                                }}
                                            >
                                                <span>{q.icon}</span> {q.text}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Summary */}
                                <div>
                                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px', fontWeight: '600' }}>
                                        📋 SUMMARY
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {[
                                            { icon: '📝', text: "Give me a portfolio summary" },
                                            { icon: '🎯', text: "Am I on track with my goals?" },
                                        ].map((q, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    setInputValue(q.text);
                                                    sendMessageDirect(q.text);
                                                }}
                                                style={{
                                                    padding: '6px 10px',
                                                    borderRadius: '16px',
                                                    fontSize: '11px',
                                                    backgroundColor: '#1e3a5f',
                                                    color: '#e2e8f0',
                                                    border: '1px solid #3f4f66',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#8b5cf6';
                                                    e.currentTarget.style.borderColor = '#8b5cf6';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#1e3a5f';
                                                    e.currentTarget.style.borderColor = '#3f4f66';
                                                }}
                                            >
                                                <span>{q.icon}</span> {q.text}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {messages.map((msg, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            display: 'flex',
                                            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                        }}
                                    >
                                        <div style={{
                                            maxWidth: '85%',
                                            padding: '10px 14px',
                                            borderRadius: msg.role === 'user'
                                                ? '16px 16px 4px 16px'
                                                : '16px 16px 16px 4px',
                                            backgroundColor: msg.role === 'user' ? '#3b82f6' : '#1e3a5f',
                                            color: '#fff',
                                            fontSize: '14px',
                                            lineHeight: '1.5',
                                            whiteSpace: 'pre-wrap'
                                        }}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                        <div style={{
                                            padding: '10px 14px',
                                            borderRadius: '16px 16px 16px 4px',
                                            backgroundColor: '#1e3a5f',
                                            color: '#94a3b8',
                                            fontSize: '14px',
                                        }}>
                                            <span style={{ display: 'inline-block', animation: 'pulse 1s infinite' }}>●</span>
                                            <span style={{ display: 'inline-block', animation: 'pulse 1s infinite 0.2s' }}>●</span>
                                            <span style={{ display: 'inline-block', animation: 'pulse 1s infinite 0.4s' }}>●</span>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>

                    {/* Input Area */}
                    <div style={{
                        padding: '16px 20px',
                        borderTop: '1px solid #1e3a5f',
                        display: 'flex',
                        gap: '12px'
                    }}>
                        <input
                            ref={inputRef}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask about your portfolio..."
                            disabled={isLoading}
                            style={{
                                flex: 1,
                                padding: '12px 16px',
                                borderRadius: '24px',
                                fontSize: '14px',
                                backgroundColor: '#0a1628',
                                color: '#fff',
                                border: '1px solid #3f4f66',
                                outline: 'none',
                            }}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!inputValue.trim() || isLoading}
                            style={{
                                padding: '12px 20px',
                                borderRadius: '24px',
                                fontSize: '14px',
                                fontWeight: '600',
                                backgroundColor: inputValue.trim() && !isLoading ? '#3b82f6' : '#1e3a5f',
                                color: inputValue.trim() && !isLoading ? '#fff' : '#64748b',
                                border: 'none',
                                cursor: inputValue.trim() && !isLoading ? 'pointer' : 'not-allowed',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            {isLoading ? '...' : '→'} Send
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
