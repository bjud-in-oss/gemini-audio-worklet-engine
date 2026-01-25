
import React, { forwardRef, useState } from 'react';
import { LayerProps } from './types';

export interface NetworkLayerRefs {
    wsRef: HTMLSpanElement | null;
    keyRef: HTMLSpanElement | null;
    txRef: HTMLDivElement | null;
    rxRef: HTMLDivElement | null;
}

interface NetworkLayerProps extends LayerProps {
    isConnected: boolean;
}

const NetworkLayer = forwardRef<NetworkLayerRefs, NetworkLayerProps>(({ onExplain, highlightMap }, ref) => {
    
    // Config functionality moved to LogicLayer/Metrics for consolidation
    
    const setRef = (key: keyof NetworkLayerRefs) => (el: any) => {
        if (ref && typeof ref === 'object' && ref.current) {
            ref.current[key] = el;
        }
    };

    // STANDARDISERAD KNAPP-DESIGN
    const getHighlightClass = (id: string) => {
        const type = highlightMap?.[id];
        if (type === 'self') return 'ring-2 ring-white bg-slate-700 scale-105 shadow-xl z-20';
        if (type === 'incoming') return 'ring-1 ring-blue-500 bg-blue-500/20';
        if (type === 'outgoing') return 'ring-1 ring-yellow-500 bg-yellow-500/20';
        return 'bg-slate-900/50 hover:bg-slate-800';
    };

    return (
        <div className="bg-slate-900/40 border-b border-sky-500/20 pb-2">
            <div className="grid grid-cols-4 gap-2 text-center">
                {/* METRICS */}
                <div className={`rounded p-1 cursor-pointer transition-all duration-200 ${getHighlightClass('KEY')}`} onClick={() => onExplain('KEY')}>
                    <div className="text-sky-500/70 text-[10px] font-bold mb-1">KEY</div>
                    <span ref={setRef('keyRef')} className="text-sm font-mono">...</span>
                </div>
                <div className={`rounded p-1 cursor-pointer transition-all duration-200 ${getHighlightClass('WS')}`} onClick={() => onExplain('WS')}>
                    <div className="text-sky-500/70 text-[10px] font-bold mb-1">WS</div>
                    <span ref={setRef('wsRef')} className="text-sm font-mono">---</span>
                </div>
                <div className={`rounded p-1 flex flex-col items-center cursor-pointer transition-all duration-200 ${getHighlightClass('TX')}`} onClick={() => onExplain('TX')}>
                    <div className="text-sky-500/70 text-[10px] font-bold mb-2">TX</div>
                    <div ref={setRef('txRef')} className="w-3 h-3 rounded-full bg-slate-800 transition-colors duration-75"></div>
                </div>
                <div className={`rounded p-1 flex flex-col items-center cursor-pointer transition-all duration-200 ${getHighlightClass('RX')}`} onClick={() => onExplain('RX')}>
                    <div className="text-sky-500/70 text-[10px] font-bold mb-2">RX</div>
                    <div ref={setRef('rxRef')} className="w-3 h-3 rounded-full bg-slate-800 transition-colors duration-75"></div>
                </div>
            </div>
        </div>
    );
});

export default NetworkLayer;
