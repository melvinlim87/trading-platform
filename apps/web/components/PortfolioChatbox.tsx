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

    // Better suggested questions based on CTO spec
    const suggestedQuestions = [
        "Why am I up/down today?",
        "What's my best performing position?",
        "How diversified is my portfolio?",
        "Can I buy more crypto?",
    ];

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
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                                textAlign: 'center'
                            }}>
                                <span style={{ fontSize: '40px', marginBottom: '12px' }}>💬</span>
                                <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '16px' }}>
                                    Ask me anything about your {positions.length} positions!
                                </p>
                                <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '8px',
                                    justifyContent: 'center'
                                }}>
                                    {suggestedQuestions.map((q, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                setInputValue(q);
                                                inputRef.current?.focus();
                                            }}
                                            style={{
                                                padding: '8px 12px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                backgroundColor: '#1e3a5f',
                                                color: '#e2e8f0',
                                                border: '1px solid #3f4f66',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
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
                                            {q}
                                        </button>
                                    ))}
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
