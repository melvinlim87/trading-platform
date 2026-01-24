'use client';

import React, { useState, useEffect, useCallback } from 'react';
import GridLayout, { Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';

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

const STORAGE_KEY = 'dashboard-card-layout';
const COLS = 10;
const ROW_HEIGHT = 55;

export function DraggableDashboard({ cards }: DraggableDashboardProps) {
    const [layout, setLayout] = useState<Layout[]>([]);
    const [minimized, setMinimized] = useState<Set<string>>(new Set());
    const [mounted, setMounted] = useState(false);
    const [containerWidth, setContainerWidth] = useState(1000);

    // Generate default layout - 5 cards in a row
    const generateDefaultLayout = useCallback((): Layout[] => {
        return cards.map((card, index) => ({
            i: card.id,
            x: (index % 5) * 2,
            y: Math.floor(index / 5) * 2,
            w: 2,
            h: 2,
            minW: 1,
            minH: 1,
        }));
    }, [cards]);

    useEffect(() => {
        setMounted(true);

        // Load layout from localStorage
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setLayout(parsed.layout || generateDefaultLayout());
                setMinimized(new Set(parsed.minimized || []));
            } catch {
                setLayout(generateDefaultLayout());
            }
        } else {
            setLayout(generateDefaultLayout());
        }

        // Update container width
        const updateWidth = () => {
            const container = document.querySelector('.dashboard-grid-container');
            if (container) {
                setContainerWidth(container.clientWidth - 24); // Account for padding
            }
        };
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, [generateDefaultLayout]);

    const handleLayoutChange = (newLayout: Layout[]) => {
        setLayout(newLayout);
        saveToStorage(newLayout, minimized);
    };

    const saveToStorage = (layoutData: Layout[], minimizedSet: Set<string>) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            layout: layoutData,
            minimized: Array.from(minimizedSet)
        }));
    };

    const toggleMinimize = (id: string) => {
        const newMinimized = new Set(minimized);
        if (newMinimized.has(id)) {
            newMinimized.delete(id);
        } else {
            newMinimized.add(id);
        }
        setMinimized(newMinimized);
        saveToStorage(layout, newMinimized);
    };

    const handleResetLayout = () => {
        const defaultLayout = generateDefaultLayout();
        setLayout(defaultLayout);
        setMinimized(new Set());
        localStorage.removeItem(STORAGE_KEY);
    };

    if (!mounted) return null;

    const glowColor = '#f59e0b';

    return (
        <div className="dashboard-grid-container" style={{ width: '100%', padding: '0 12px' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
            }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                    📌 Drag cards to reorder • ↔️ Pull corners to resize • Click − to minimize • Layout auto-saves
                </span>
                <button
                    onClick={handleResetLayout}
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

            {/* Grid */}
            <GridLayout
                className="layout"
                layout={layout}
                cols={COLS}
                rowHeight={ROW_HEIGHT}
                width={containerWidth}
                onLayoutChange={handleLayoutChange}
                draggableHandle=".card-drag-handle"
                resizeHandles={['se', 'sw', 'ne', 'nw', 'e', 'w', 's', 'n']}
                compactType="vertical"
                preventCollision={false}
                isResizable={true}
                isDraggable={true}
                margin={[12, 12]}
            >
                {cards.map((card) => {
                    const isMin = minimized.has(card.id);
                    return (
                        <div
                            key={card.id}
                            style={{
                                background: 'linear-gradient(135deg, #0d1f3c 0%, #1e3a5f 100%)',
                                borderRadius: '12px',
                                border: '1px solid #3f4f66',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                boxShadow: `0 0 20px ${glowColor}22, inset 0 1px 0 ${glowColor}11`,
                                transition: 'box-shadow 0.2s, border-color 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = glowColor;
                                e.currentTarget.style.boxShadow = `0 0 30px ${glowColor}44, inset 0 1px 0 ${glowColor}22`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#3f4f66';
                                e.currentTarget.style.boxShadow = `0 0 20px ${glowColor}22, inset 0 1px 0 ${glowColor}11`;
                            }}
                        >
                            {/* Card Content */}
                            <div
                                className="card-drag-handle"
                                style={{
                                    padding: isMin ? '10px 14px' : '16px 20px',
                                    cursor: 'grab',
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    position: 'relative'
                                }}
                            >
                                {/* Minimize button */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleMinimize(card.id); }}
                                    style={{
                                        position: 'absolute',
                                        top: '8px',
                                        right: '8px',
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '4px',
                                        background: '#1e3a5f',
                                        border: 'none',
                                        color: '#64748b',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        lineHeight: 1
                                    }}
                                    title={isMin ? 'Expand' : 'Minimize'}
                                >
                                    {isMin ? '+' : '−'}
                                </button>

                                {/* Header row */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: isMin ? '0' : '8px' }}>
                                    <span style={{ fontSize: isMin ? '14px' : '18px' }}>{card.icon}</span>
                                    <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>{card.label}</span>
                                </div>

                                {/* Value - only show if not minimized */}
                                {!isMin && (
                                    <>
                                        <div style={{
                                            fontSize: 'clamp(18px, 2.5vw, 28px)',
                                            fontWeight: '700',
                                            color: card.color,
                                            marginBottom: '4px',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>
                                            {card.value}
                                        </div>
                                        <div style={{
                                            fontSize: '11px',
                                            color: '#64748b',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>
                                            {card.subValue}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </GridLayout>

            {/* Custom styles for resize handles */}
            <style jsx global>{`
                .react-grid-item > .react-resizable-handle {
                    position: absolute;
                    width: 16px;
                    height: 16px;
                    background: transparent;
                    z-index: 10;
                }
                .react-grid-item > .react-resizable-handle::after {
                    content: '';
                    position: absolute;
                    width: 6px;
                    height: 6px;
                    border-right: 2px solid #0ea5e9;
                    border-bottom: 2px solid #0ea5e9;
                    opacity: 0;
                    transition: opacity 0.2s;
                }
                .react-grid-item:hover > .react-resizable-handle::after {
                    opacity: 0.7;
                }
                .react-grid-item > .react-resizable-handle-se {
                    right: 2px;
                    bottom: 2px;
                    cursor: se-resize;
                }
                .react-grid-item > .react-resizable-handle-se::after {
                    right: 2px;
                    bottom: 2px;
                }
                .react-grid-item > .react-resizable-handle-sw {
                    left: 2px;
                    bottom: 2px;
                    cursor: sw-resize;
                }
                .react-grid-item > .react-resizable-handle-sw::after {
                    left: 2px;
                    bottom: 2px;
                    transform: rotate(90deg);
                }
                .react-grid-item > .react-resizable-handle-ne {
                    right: 2px;
                    top: 2px;
                    cursor: ne-resize;
                }
                .react-grid-item > .react-resizable-handle-ne::after {
                    right: 2px;
                    top: 2px;
                    transform: rotate(-90deg);
                }
                .react-grid-item > .react-resizable-handle-nw {
                    left: 2px;
                    top: 2px;
                    cursor: nw-resize;
                }
                .react-grid-item > .react-resizable-handle-nw::after {
                    left: 2px;
                    top: 2px;
                    transform: rotate(180deg);
                }
                .react-grid-item > .react-resizable-handle-e,
                .react-grid-item > .react-resizable-handle-w {
                    top: 50%;
                    transform: translateY(-50%);
                    height: 40px;
                    width: 8px;
                    cursor: ew-resize;
                }
                .react-grid-item > .react-resizable-handle-e { right: 0; }
                .react-grid-item > .react-resizable-handle-w { left: 0; }
                .react-grid-item > .react-resizable-handle-n,
                .react-grid-item > .react-resizable-handle-s {
                    left: 50%;
                    transform: translateX(-50%);
                    width: 40px;
                    height: 8px;
                    cursor: ns-resize;
                }
                .react-grid-item > .react-resizable-handle-n { top: 0; }
                .react-grid-item > .react-resizable-handle-s { bottom: 0; }
                .react-grid-item.react-grid-placeholder {
                    background: #0ea5e9 !important;
                    opacity: 0.15 !important;
                    border-radius: 12px;
                }
                .react-grid-item.resizing {
                    opacity: 0.9;
                    z-index: 100;
                }
                .react-grid-item.react-draggable-dragging {
                    opacity: 0.95;
                    z-index: 100;
                    box-shadow: 0 10px 40px rgba(14, 165, 233, 0.4) !important;
                }
                .card-drag-handle:active {
                    cursor: grabbing;
                }
            `}</style>
        </div>
    );
}

export default DraggableDashboard;
