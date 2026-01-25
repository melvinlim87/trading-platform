'use client';

import React, { useState, useEffect } from 'react';

export interface CardData {
    id: string;
    label: string;
    value: string;
    subValue: string;
    icon: string;
    color: string;
}

interface DraggableDashboardProps {
    cards: CardData[];
}

const STORAGE_KEY = 'dashboard-card-order-v3';

export function DraggableDashboard({ cards: initialCards }: DraggableDashboardProps) {
    const [cards, setCards] = useState<CardData[]>(initialCards);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Load saved order from localStorage
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const savedOrder = JSON.parse(saved);
                // Reorder cards based on saved order
                const reordered = savedOrder
                    .map((id: string) => initialCards.find(c => c.id === id))
                    .filter(Boolean);
                // Add any new cards not in saved order
                const newCards = initialCards.filter(c => !savedOrder.includes(c.id));
                setCards([...reordered, ...newCards]);
            } catch {
                setCards(initialCards);
            }
        } else {
            setCards(initialCards);
        }
    }, [initialCards]);

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newCards = [...cards];
        const [draggedCard] = newCards.splice(draggedIndex, 1);
        newCards.splice(index, 0, draggedCard);
        setCards(newCards);
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        // Save order to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cards.map(c => c.id)));
    };

    const handleReset = () => {
        setCards(initialCards);
        localStorage.removeItem(STORAGE_KEY);
    };

    if (!mounted) return null;

    const glowColor = '#f59e0b';

    return (
        <div style={{ width: '100%' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                padding: '0 4px'
            }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                    📌 Drag cards to reorder • Layout auto-saves
                </span>
                <button
                    onClick={handleReset}
                    style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: '#1e3a5f',
                        color: '#94a3b8',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                >
                    🔄 Reset Layout
                </button>
            </div>

            {/* Cards Grid - Simple Flexbox */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px',
            }}>
                {cards.map((card, index) => (
                    <div
                        key={card.id}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        style={{
                            padding: '20px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #0d1f3c 0%, #1e3a5f 100%)',
                            border: `1px solid ${draggedIndex === index ? glowColor : '#3f4f66'}`,
                            cursor: 'grab',
                            transition: 'all 0.2s ease',
                            transform: draggedIndex === index ? 'scale(1.02)' : 'scale(1)',
                            boxShadow: `0 0 20px ${glowColor}22, inset 0 1px 0 ${glowColor}11`,
                            opacity: draggedIndex === index ? 0.8 : 1,
                        }}
                        onMouseEnter={(e) => {
                            if (draggedIndex === null) {
                                e.currentTarget.style.borderColor = glowColor;
                                e.currentTarget.style.boxShadow = `0 0 30px ${glowColor}44, inset 0 1px 0 ${glowColor}22`;
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#3f4f66';
                            e.currentTarget.style.boxShadow = `0 0 20px ${glowColor}22, inset 0 1px 0 ${glowColor}11`;
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                    >
                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <span style={{ fontSize: '18px' }}>{card.icon}</span>
                            <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '500' }}>{card.label}</span>
                        </div>

                        {/* Value */}
                        <div style={{
                            fontSize: '26px',
                            fontWeight: '700',
                            color: card.color,
                            marginBottom: '8px',
                            lineHeight: 1.1
                        }}>
                            {card.value}
                        </div>

                        {/* Sub Value */}
                        <div style={{
                            fontSize: '12px',
                            color: '#94a3b8',
                            lineHeight: 1.3
                        }}>
                            {card.subValue}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default DraggableDashboard;
