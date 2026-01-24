'use client';

import React, { useState, useEffect, useCallback } from 'react';
import GridLayout, { Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';

interface WidgetData {
    id: string;
    title: string;
    icon?: string;
    minW?: number;
    minH?: number;
    content: React.ReactNode;
}

interface ResizableWidgetGridProps {
    widgets: WidgetData[];
    cols?: number;
    rowHeight?: number;
    storageKey?: string;
}

const defaultLayouts: Record<string, Partial<Layout>> = {
    'portfolio-value': { x: 0, y: 0, w: 2, h: 2, minW: 2, minH: 2 },
    'cash-reserves': { x: 2, y: 0, w: 2, h: 2, minW: 2, minH: 2 },
    'capital-invested': { x: 4, y: 0, w: 2, h: 2, minW: 2, minH: 2 },
    'total-returns': { x: 6, y: 0, w: 2, h: 2, minW: 2, minH: 2 },
    'todays-gain': { x: 8, y: 0, w: 2, h: 2, minW: 2, minH: 2 },
    'portfolio-chart': { x: 0, y: 2, w: 5, h: 5, minW: 3, minH: 3 },
    'pnl-chart': { x: 5, y: 2, w: 5, h: 5, minW: 3, minH: 3 },
    'ai-mentor': { x: 0, y: 7, w: 5, h: 6, minW: 4, minH: 4 },
    'broker-accounts': { x: 5, y: 7, w: 5, h: 6, minW: 4, minH: 3 },
};

export function ResizableWidgetGrid({
    widgets,
    cols = 10,
    rowHeight = 40,
    storageKey = 'portfolio-widget-layout'
}: ResizableWidgetGridProps) {
    const [layout, setLayout] = useState<Layout[]>([]);
    const [mounted, setMounted] = useState(false);
    const [containerWidth, setContainerWidth] = useState(1200);

    // Initialize layout from localStorage or defaults
    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                setLayout(JSON.parse(saved));
            } catch {
                setLayout(generateDefaultLayout());
            }
        } else {
            setLayout(generateDefaultLayout());
        }

        // Set container width
        const updateWidth = () => {
            const container = document.querySelector('.widget-grid-container');
            if (container) {
                setContainerWidth(container.clientWidth);
            }
        };
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, [storageKey]);

    const generateDefaultLayout = useCallback((): Layout[] => {
        return widgets.map((widget, index) => {
            const defaults = defaultLayouts[widget.id] || {
                x: (index % 5) * 2,
                y: Math.floor(index / 5) * 2,
                w: 2,
                h: 2,
                minW: 2,
                minH: 2
            };
            return {
                i: widget.id,
                x: defaults.x ?? 0,
                y: defaults.y ?? 0,
                w: defaults.w ?? 2,
                h: defaults.h ?? 2,
                minW: widget.minW ?? defaults.minW ?? 2,
                minH: widget.minH ?? defaults.minH ?? 2,
            };
        });
    }, [widgets]);

    const handleLayoutChange = (newLayout: Layout[]) => {
        setLayout(newLayout);
        localStorage.setItem(storageKey, JSON.stringify(newLayout));
    };

    const handleResetLayout = () => {
        const defaultLayout = generateDefaultLayout();
        setLayout(defaultLayout);
        localStorage.removeItem(storageKey);
    };

    if (!mounted) return null;

    return (
        <div className="widget-grid-container" style={{ width: '100%' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
                padding: '0 4px'
            }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                    📌 Drag widgets to reorder • ↔️ Drag edges to resize • Layout auto-saves
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
                cols={cols}
                rowHeight={rowHeight}
                width={containerWidth}
                onLayoutChange={handleLayoutChange}
                draggableHandle=".widget-drag-handle"
                resizeHandles={['se', 'sw', 'ne', 'nw', 'e', 'w', 's', 'n']}
                compactType="vertical"
                preventCollision={false}
                isResizable={true}
                isDraggable={true}
                margin={[12, 12]}
            >
                {widgets.map((widget) => (
                    <div
                        key={widget.id}
                        style={{
                            backgroundColor: '#0d1f3c',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                            border: '1px solid #1e3a5f44'
                        }}
                    >
                        {/* Drag Handle Header */}
                        <div
                            className="widget-drag-handle"
                            style={{
                                padding: '10px 14px',
                                backgroundColor: '#0a1628',
                                borderBottom: '1px solid #1e3a5f44',
                                cursor: 'grab',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                flexShrink: 0
                            }}
                        >
                            {widget.icon && <span style={{ fontSize: '14px' }}>{widget.icon}</span>}
                            <span style={{
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#fff',
                                flex: 1
                            }}>
                                {widget.title}
                            </span>
                            <span style={{
                                fontSize: '10px',
                                color: '#64748b',
                                cursor: 'grab'
                            }}>
                                ⋮⋮
                            </span>
                        </div>

                        {/* Content */}
                        <div style={{
                            flex: 1,
                            overflow: 'auto',
                            padding: '12px'
                        }}>
                            {widget.content}
                        </div>
                    </div>
                ))}
            </GridLayout>

            {/* Custom styles for resize handles */}
            <style jsx global>{`
                .react-grid-item > .react-resizable-handle {
                    position: absolute;
                    width: 20px;
                    height: 20px;
                    background: transparent;
                }
                .react-grid-item > .react-resizable-handle::after {
                    content: '';
                    position: absolute;
                    right: 3px;
                    bottom: 3px;
                    width: 8px;
                    height: 8px;
                    border-right: 2px solid #0ea5e9;
                    border-bottom: 2px solid #0ea5e9;
                    opacity: 0.5;
                    transition: opacity 0.2s;
                }
                .react-grid-item:hover > .react-resizable-handle::after {
                    opacity: 1;
                }
                .react-grid-item.react-grid-placeholder {
                    background: #0ea5e9 !important;
                    opacity: 0.2 !important;
                    border-radius: 12px;
                }
                .react-grid-item.resizing {
                    opacity: 0.9;
                }
                .react-grid-item.react-draggable-dragging {
                    opacity: 0.9;
                    z-index: 100;
                    box-shadow: 0 10px 40px rgba(14, 165, 233, 0.3) !important;
                }
                .widget-drag-handle:active {
                    cursor: grabbing;
                }
            `}</style>
        </div>
    );
}

export default ResizableWidgetGrid;
