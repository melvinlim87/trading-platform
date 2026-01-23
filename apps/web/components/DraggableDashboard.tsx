'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

export interface CardData {
    id: string;
    label: string;
    value: string;
    subValue: string;
    icon: string;
    color: string;
}

interface DraggableCardProps {
    card: CardData;
    index: number;
    isMinimized: boolean;
    onMinimize: (id: string) => void;
    onDragStart: (index: number) => void;
    onDragOver: (index: number) => void;
    onDragEnd: () => void;
    isDragging: boolean;
    dragOverIndex: number | null;
}

function DraggableCard({
    card,
    index,
    isMinimized,
    onMinimize,
    onDragStart,
    onDragOver,
    onDragEnd,
    isDragging,
    dragOverIndex
}: DraggableCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [touchStartX, setTouchStartX] = useState(0);
    const [touchStartY, setTouchStartY] = useState(0);

    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(index);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        onDragOver(index);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        const touch = e.touches[0];
        setTouchStartX(touch.clientX);
        setTouchStartY(touch.clientY);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        // Prevent scrolling while dragging
        e.preventDefault();
    };

    const isDropTarget = dragOverIndex === index && isDragging;
    const glowColor = '#f59e0b'; // Gold glow for all cards

    return (
        <div
            ref={cardRef}
            draggable
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={onDragEnd}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            style={{
                position: 'relative',
                padding: isMinimized ? '12px 16px' : '20px 24px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0A0A0A 0%, #171717 100%)',
                border: `1px solid ${isDropTarget ? card.color : 'gold'}`,
                cursor: 'grab',
                transition: 'all 0.2s ease',
                transform: isDropTarget ? 'scale(1.02)' : 'scale(1)',
                boxShadow: `0 0 20px ${glowColor}22, inset 0 1px 0 ${glowColor}11${isDropTarget ? `, 0 0 30px ${card.color}44` : ''}`,
                opacity: isDragging && dragOverIndex !== index ? 0.7 : 1,
                minWidth: isMinimized ? 'auto' : '200px',
                flex: isMinimized ? '0 0 auto' : '1 1 200px',
            }}
            onMouseEnter={(e) => {
                if (!isDragging) {
                    e.currentTarget.style.borderColor = glowColor;
                    e.currentTarget.style.boxShadow = `0 0 30px ${glowColor}44, inset 0 1px 0 ${glowColor}22`;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                }
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = isDropTarget ? card.color : '#333';
                e.currentTarget.style.boxShadow = `0 0 20px ${glowColor}22, inset 0 1px 0 ${glowColor}11`;
                e.currentTarget.style.transform = 'scale(1)';
            }}
        >
            {/* Drag Handle */}
            <div
                style={{
                    position: 'absolute',
                    top: '8px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '30px',
                    height: '4px',
                    borderRadius: '2px',
                    backgroundColor: '#333',
                    cursor: 'grab'
                }}
            />

            {/* Minimize Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onMinimize(card.id);
                }}
                style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#171717',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = card.color;
                    e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#171717';
                    e.currentTarget.style.color = '#9ca3af';
                }}
            >
                {isMinimized ? '↗' : '−'}
            </button>

            {isMinimized ? (
                // Minimized View
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingRight: '24px' }}>
                    <span style={{ fontSize: '18px' }}>{card.icon}</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: card.color }}>
                        {card.value}
                    </span>
                </div>
            ) : (
                // Full View
                <>
                    <div style={{ marginBottom: '12px', marginTop: '8px' }}>
                        <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '13px',
                            color: '#9ca3af',
                            fontWeight: '500'
                        }}>
                            <span style={{ fontSize: '20px' }}>{card.icon}</span>
                            {card.label}
                        </span>
                    </div>
                    <div style={{
                        fontSize: '28px',
                        fontWeight: '700',
                        color: '#fff',
                        marginBottom: '8px',
                        lineHeight: '1.2'
                    }}>
                        {card.value}
                    </div>
                    <div style={{
                        fontSize: '12px',
                        color: '#64748b'
                    }}>
                        {card.subValue}
                    </div>

                    {/* Bottom accent bar */}
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '2px',
                        background: `linear-gradient(90deg, ${card.color}, ${card.color}66, transparent)`,
                        opacity: 0.8,
                        borderRadius: '0 0 12px 12px'
                    }}></div>
                </>
            )}
        </div>
    );
}

interface DraggableDashboardProps {
    cards: CardData[];
}

export function DraggableDashboard({ cards: initialCards }: DraggableDashboardProps) {
    const [cards, setCards] = useState<CardData[]>(initialCards);
    const [minimizedCards, setMinimizedCards] = useState<Set<string>>(new Set());
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    // Load saved state from localStorage
    useEffect(() => {
        const savedOrder = localStorage.getItem('dashboard-card-order');
        const savedMinimized = localStorage.getItem('dashboard-minimized-cards');

        if (savedOrder) {
            try {
                const orderIds = JSON.parse(savedOrder) as string[];
                const orderedCards = orderIds
                    .map(id => initialCards.find(c => c.id === id))
                    .filter((c): c is CardData => c !== undefined);

                // Add any new cards that weren't in saved order
                const newCards = initialCards.filter(c => !orderIds.includes(c.id));
                setCards([...orderedCards, ...newCards]);
            } catch (e) {
                setCards(initialCards);
            }
        }

        if (savedMinimized) {
            try {
                const minimized = JSON.parse(savedMinimized) as string[];
                setMinimizedCards(new Set(minimized));
            } catch (e) {
                // Ignore
            }
        }
    }, [initialCards]);

    // Save state to localStorage
    const saveState = useCallback((newCards: CardData[], newMinimized: Set<string>) => {
        localStorage.setItem('dashboard-card-order', JSON.stringify(newCards.map(c => c.id)));
        localStorage.setItem('dashboard-minimized-cards', JSON.stringify([...newMinimized]));
    }, []);

    const handleDragStart = (index: number) => {
        setDragIndex(index);
    };

    const handleDragOver = (index: number) => {
        setDragOverIndex(index);
    };

    const handleDragEnd = () => {
        if (dragIndex !== null && dragOverIndex !== null && dragIndex !== dragOverIndex) {
            const newCards = [...cards];
            const [draggedCard] = newCards.splice(dragIndex, 1);
            newCards.splice(dragOverIndex, 0, draggedCard);
            setCards(newCards);
            saveState(newCards, minimizedCards);
        }
        setDragIndex(null);
        setDragOverIndex(null);
    };

    const handleMinimize = (id: string) => {
        const newMinimized = new Set(minimizedCards);
        if (newMinimized.has(id)) {
            newMinimized.delete(id);
        } else {
            newMinimized.add(id);
        }
        setMinimizedCards(newMinimized);
        saveState(cards, newMinimized);
    };

    const handleResetLayout = () => {
        setCards(initialCards);
        setMinimizedCards(new Set());
        localStorage.removeItem('dashboard-card-order');
        localStorage.removeItem('dashboard-minimized-cards');
    };

    return (
        <div>
            {/* Reset Button */}
            <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: '8px'
            }}>
                <button
                    onClick={handleResetLayout}
                    style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        backgroundColor: '#171717',
                        color: '#9ca3af',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}
                >
                    ↻ Reset Layout
                </button>
            </div>

            {/* Cards Grid - Responsive */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '16px',
            }}>
                {cards.map((card, index) => (
                    <DraggableCard
                        key={card.id}
                        card={card}
                        index={index}
                        isMinimized={minimizedCards.has(card.id)}
                        onMinimize={handleMinimize}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                        isDragging={dragIndex !== null}
                        dragOverIndex={dragOverIndex}
                    />
                ))}
            </div>

            {/* Mobile Instructions */}
            <p style={{
                fontSize: '11px',
                color: '#64748b',
                marginTop: '12px',
                textAlign: 'center'
            }}>
                💡 Drag cards to reorder • Click − to minimize • Layout auto-saves
            </p>
        </div>
    );
}
