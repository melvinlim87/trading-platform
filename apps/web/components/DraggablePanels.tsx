'use client';

import React, { useState, useEffect, ReactNode } from 'react';

export interface PanelConfig {
    id: string;
    title: string;
    icon: string;
    defaultExpanded?: boolean;
    render: () => ReactNode;
}

interface DraggablePanelsProps {
    panels: PanelConfig[];
    storageKey: string;
}

export function DraggablePanels({ panels: initialPanels, storageKey }: DraggablePanelsProps) {
    const [panelOrder, setPanelOrder] = useState<string[]>(initialPanels.map(p => p.id));
    const [expandedPanels, setExpandedPanels] = useState<Record<string, boolean>>({});
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Load saved order from localStorage
        const savedOrder = localStorage.getItem(`${storageKey}-order`);
        const savedExpanded = localStorage.getItem(`${storageKey}-expanded`);

        if (savedOrder) {
            try {
                const order = JSON.parse(savedOrder);
                // Filter out invalid IDs and add any new panels
                const validOrder = order.filter((id: string) => initialPanels.some(p => p.id === id));
                const newPanels = initialPanels.filter(p => !order.includes(p.id)).map(p => p.id);
                setPanelOrder([...validOrder, ...newPanels]);
            } catch {
                setPanelOrder(initialPanels.map(p => p.id));
            }
        }

        if (savedExpanded) {
            try {
                setExpandedPanels(JSON.parse(savedExpanded));
            } catch {
                // Set defaults
                const defaults: Record<string, boolean> = {};
                initialPanels.forEach(p => { defaults[p.id] = p.defaultExpanded ?? true; });
                setExpandedPanels(defaults);
            }
        } else {
            // Set defaults
            const defaults: Record<string, boolean> = {};
            initialPanels.forEach(p => { defaults[p.id] = p.defaultExpanded ?? true; });
            setExpandedPanels(defaults);
        }
    }, [initialPanels, storageKey]);

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newOrder = [...panelOrder];
        const [dragged] = newOrder.splice(draggedIndex, 1);
        newOrder.splice(index, 0, dragged);
        setPanelOrder(newOrder);
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        localStorage.setItem(`${storageKey}-order`, JSON.stringify(panelOrder));
    };

    const togglePanel = (id: string) => {
        const newExpanded = { ...expandedPanels, [id]: !expandedPanels[id] };
        setExpandedPanels(newExpanded);
        localStorage.setItem(`${storageKey}-expanded`, JSON.stringify(newExpanded));
    };

    const handleReset = () => {
        const defaultOrder = initialPanels.map(p => p.id);
        const defaultExpanded: Record<string, boolean> = {};
        initialPanels.forEach(p => { defaultExpanded[p.id] = p.defaultExpanded ?? true; });

        setPanelOrder(defaultOrder);
        setExpandedPanels(defaultExpanded);
        localStorage.removeItem(`${storageKey}-order`);
        localStorage.removeItem(`${storageKey}-expanded`);
    };

    if (!mounted) return null;

    // Get ordered panels
    const orderedPanels = panelOrder
        .map(id => initialPanels.find(p => p.id === id))
        .filter(Boolean) as PanelConfig[];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0 4px'
            }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                    📌 Drag panels to reorder • Layout auto-saves
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

            {/* Panels */}
            {orderedPanels.map((panel, index) => {
                const isExpanded = expandedPanels[panel.id] ?? true;
                const isDragging = draggedIndex === index;

                return (
                    <div
                        key={panel.id}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        style={{
                            backgroundColor: '#0d1f3c',
                            borderRadius: '12px',
                            border: `1px solid ${isDragging ? '#f59e0b' : '#1e3a5f'}`,
                            overflow: 'hidden',
                            transition: 'all 0.2s ease',
                            transform: isDragging ? 'scale(1.01)' : 'scale(1)',
                            opacity: isDragging ? 0.9 : 1,
                            boxShadow: isDragging ? '0 8px 30px rgba(245, 158, 11, 0.2)' : 'none'
                        }}
                    >
                        {/* Panel Header */}
                        <div
                            style={{
                                padding: '16px 20px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                cursor: 'grab',
                                backgroundColor: '#0d1f3c',
                                borderBottom: isExpanded ? '1px solid #1e3a5f33' : 'none'
                            }}
                        >
                            <div
                                style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, cursor: 'pointer' }}
                                onClick={() => togglePanel(panel.id)}
                            >
                                <span style={{ fontSize: '18px' }}>{panel.icon}</span>
                                <span style={{ fontSize: '16px', fontWeight: '600', color: '#fff' }}>{panel.title}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '12px', color: '#64748b' }}>⋮⋮</span>
                                <span
                                    onClick={() => togglePanel(panel.id)}
                                    style={{
                                        color: '#64748b',
                                        transition: 'transform 0.2s',
                                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                        cursor: 'pointer'
                                    }}
                                >▼</span>
                            </div>
                        </div>

                        {/* Panel Content */}
                        {isExpanded && (
                            <div style={{ padding: '0 20px 20px' }}>
                                {panel.render()}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default DraggablePanels;
