
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { KNOWLEDGE_BASE } from '../TowerKnowledge';

interface GraphNode {
    id: string;
    x: number;
    y: number;
    title: string;
    tags: string[];
}

interface SystemMapProps {
    focusOnNode?: string | null; // ID to auto-center on
    interactive?: boolean;       // Enable dragging?
    minimal?: boolean;           // Hide title/overlay?
    onNodeClick?: (id: string) => void; // New prop for navigation
}

const SystemMap: React.FC<SystemMapProps> = ({ focusOnNode, interactive = true, minimal = false, onNodeClick }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    
    const [nodes, setNodes] = useState<GraphNode[]>([]);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const dragDistanceRef = useRef(0); // To distinguish click from drag
    
    // ViewBox State for Pan/Zoom
    const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: 100, h: 100 });

    // Initialize nodes
    useEffect(() => {
        const initNodes = Object.entries(KNOWLEDGE_BASE)
            .filter(([_, entry]) => entry.x !== undefined && entry.y !== undefined)
            .map(([id, entry]) => ({
                id,
                x: entry.x!,
                y: entry.y!,
                title: entry.title,
                tags: entry.tags || []
            }));
        setNodes(initNodes);
    }, []);

    // AUTO-FOCUS LOGIC
    useEffect(() => {
        if (focusOnNode) {
            const target = nodes.find(n => n.id === focusOnNode);
            if (target) {
                // Zoom in (w: 60, h: 60) and center on target
                const zoomLevel = 50; 
                setViewBox({
                    x: target.x - (zoomLevel / 2),
                    y: target.y - (zoomLevel / 2),
                    w: zoomLevel,
                    h: zoomLevel
                });
            }
        } else {
            // Reset to full view if no focus (only if minimal mode isn't forcing a view)
            if (!minimal) setViewBox({ x: 0, y: 0, w: 100, h: 100 });
        }
    }, [focusOnNode, nodes, minimal]);

    // Helper: Find links
    const links = useMemo(() => {
        const list: { from: string, to: string, desc: string, x1: number, y1: number, x2: number, y2: number }[] = [];
        nodes.forEach(node => {
            const entry = KNOWLEDGE_BASE[node.id];
            if (entry && entry.affects) {
                entry.affects.forEach(rel => {
                    const target = nodes.find(n => n.id === rel.id);
                    if (target) {
                        list.push({ from: node.id, to: target.id, desc: rel.desc, x1: node.x, y1: node.y, x2: target.x, y2: target.y });
                    }
                });
            }
        });
        return list;
    }, [nodes]);

    // Color helper - STRICT PALETTE
    const getNodeColor = (tags: string[]) => {
        if (tags.includes('AI') || tags.includes('PRED')) return '#d946ef'; // Fuchsia-500
        if (tags.includes('NET') || tags.includes('Transport')) return '#0ea5e9';    // Sky-500
        if (tags.includes('LOGIC')) return '#10b981';  // Emerald-500
        if (tags.includes('AUDIO')) return '#8b5cf6'; // Violet-500
        return '#64748b'; // Slate-500
    };

    // --- INTERACTION ---
    const handlePointerDown = (e: React.PointerEvent, id: string) => {
        e.preventDefault(); e.stopPropagation();
        
        // Always track initial click for "click" detection, even if interactive is false
        setDraggingId(id); 
        setHoveredId(id);
        dragDistanceRef.current = 0;
        
        if (e.target instanceof Element) (e.target as Element).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!svgRef.current) return;
        e.preventDefault();

        // Calculate movement distance to detect drag vs click
        dragDistanceRef.current += Math.hypot(e.movementX, e.movementY);

        // If dragging a node - ONLY IF INTERACTIVE
        if (draggingId && interactive) {
            const svgRect = svgRef.current.getBoundingClientRect();
            const scaleX = viewBox.w / svgRect.width;
            const scaleY = viewBox.h / svgRect.height;

            setNodes(prev => prev.map(n => {
                if (n.id !== draggingId) return n;
                return { ...n, x: n.x + (e.movementX * scaleX), y: n.y + (e.movementY * scaleY) };
            }));
            return;
        }

        // If panning the map (background drag) - ONLY IF INTERACTIVE
        if (e.buttons === 1 && !draggingId && interactive) {
             const svgRect = svgRef.current.getBoundingClientRect();
             const scaleX = viewBox.w / svgRect.width;
             const scaleY = viewBox.h / svgRect.height;
             
             setViewBox(prev => ({
                 ...prev,
                 x: prev.x - (e.movementX * scaleX),
                 y: prev.y - (e.movementY * scaleY)
             }));
        }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        // Detect Click (Movement < 5 pixels)
        // Works regardless of interactive state
        if (draggingId && dragDistanceRef.current < 5 && onNodeClick) {
            onNodeClick(draggingId);
        }

        setDraggingId(null);
        if (e.target instanceof Element) e.target.releasePointerCapture(e.pointerId);
    };

    return (
        <div className={`w-full bg-slate-950 rounded-xl border border-slate-800 overflow-hidden relative group/container ${minimal ? '' : 'p-2 mb-6'}`}>
            {!minimal && (
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest absolute top-2 left-3 z-10 pointer-events-none">
                    Systemkarta
                </h4>
            )}
            
            {focusOnNode && (
                <div className="absolute top-2 right-2 z-10 bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded text-[8px] font-bold border border-indigo-500/30 pointer-events-none animate-in fade-in">
                    FOKUS: {focusOnNode}
                </div>
            )}
            
            {/* LEGEND - SEMI TRANSPARENT OVERLAY */}
            <div className="absolute bottom-2 left-2 z-10 pointer-events-none flex gap-2 opacity-70 text-[7px] font-bold font-mono bg-black/40 p-1 rounded backdrop-blur-sm">
                <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div><span className="text-emerald-400">LOG</span></div>
                <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-sky-500"></div><span className="text-sky-400">NET</span></div>
                <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-fuchsia-500"></div><span className="text-fuchsia-400">AI</span></div>
                <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-violet-500"></div><span className="text-violet-400">AUD</span></div>
            </div>

            <svg 
                ref={svgRef}
                viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
                className={`w-full select-none touch-none ${minimal ? 'h-48' : 'h-64 md:h-80'}`}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                style={{ cursor: draggingId ? 'grabbing' : (interactive ? 'grab' : 'pointer') }}
            >
                <defs>
                    <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5.5" refY="3" orient="auto">
                        <polygon points="0 0, 4 2, 0 4" fill="#334155" />
                    </marker>
                    {/* INCOMING COLOR (Blue) */}
                    <marker id="arrowhead-incoming" markerWidth="6" markerHeight="6" refX="5.5" refY="3" orient="auto">
                        <polygon points="0 0, 4 2, 0 4" fill="#3b82f6" />
                    </marker>
                    {/* OUTGOING COLOR (Yellow) */}
                    <marker id="arrowhead-outgoing" markerWidth="6" markerHeight="6" refX="5.5" refY="3" orient="auto">
                        <polygon points="0 0, 4 2, 0 4" fill="#eab308" />
                    </marker>
                </defs>

                {/* LINKS */}
                {links.map((link) => {
                    // Logic for Coloring based on Focus
                    let color = "#1e293b";
                    let marker = "url(#arrowhead)";
                    let opacity = 0.2;
                    let strokeWidth = 0.3;

                    if (focusOnNode) {
                        if (link.from === focusOnNode) {
                            // OUTGOING -> Yellow
                            color = "#eab308";
                            marker = "url(#arrowhead-outgoing)";
                            opacity = 1;
                            strokeWidth = 0.6;
                        } else if (link.to === focusOnNode) {
                            // INCOMING -> Blue
                            color = "#3b82f6";
                            marker = "url(#arrowhead-incoming)";
                            opacity = 1;
                            strokeWidth = 0.6;
                        } else {
                            // UNRELATED -> Dimmed
                            opacity = 0.05;
                        }
                    } else if (hoveredId) {
                        // Hover Logic
                        if (link.from === hoveredId || link.to === hoveredId) {
                            opacity = 1;
                            color = "#94a3b8";
                        }
                    } else {
                        // Default
                        opacity = 0.4;
                    }

                    return (
                        <g key={`${link.from}-${link.to}`} style={{ opacity, transition: 'opacity 0.3s' }}>
                            <line x1={link.x1} y1={link.y1} x2={link.x2} y2={link.y2} stroke={color} strokeWidth={strokeWidth} markerEnd={marker} />
                        </g>
                    );
                })}

                {/* NODES */}
                {nodes.map(node => {
                    const isActive = hoveredId === node.id || draggingId === node.id;
                    const isFocused = focusOnNode === node.id;
                    const color = getNodeColor(node.tags);

                    return (
                        <g 
                            key={node.id} 
                            className="cursor-pointer"
                            style={{ opacity: 1, transition: 'opacity 0.3s' }}
                            onPointerDown={(e) => handlePointerDown(e, node.id)}
                            onPointerEnter={() => !draggingId && setHoveredId(node.id)}
                            onPointerLeave={() => !draggingId && setHoveredId(null)}
                        >
                            {/* Halo */}
                            <circle cx={node.x} cy={node.y} r={isActive || isFocused ? 4 : 0} fill="none" stroke={color} strokeWidth="0.5" opacity="0.5" className="transition-all duration-300" />
                            
                            {/* Body */}
                            <circle cx={node.x} cy={node.y} r={isFocused ? 2.5 : 1.5} fill={color} className="transition-all duration-300" />

                            {/* Label */}
                            <text 
                                x={node.x} 
                                y={node.y + (isFocused ? 5 : 4)} 
                                fontSize={isFocused ? "3" : "2.5"} 
                                textAnchor="middle" 
                                fill={isActive || isFocused ? "#fff" : "#94a3b8"} 
                                className="font-mono font-bold pointer-events-none transition-all select-none"
                                style={{ textShadow: isActive || isFocused ? '0 1px 2px black' : 'none' }}
                            >
                                {node.id}
                            </text>
                        </g>
                    );
                })}
            </svg>
            
            {!minimal && (
                <div className="absolute bottom-1 right-2 text-[8px] text-slate-700 italic pointer-events-none">
                    v5.6 | Visual Tracing
                </div>
            )}
        </div>
    );
};

export default SystemMap;
