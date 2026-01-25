
import React, { forwardRef, useState } from 'react';
import { LayerProps } from './types';
// IMPORT NEW COMPONENTS
import BufferVisualizer from '../BufferVisualizer';
import JitterSimulator from '../JitterSimulator';
import { useGeminiLive } from '../../hooks/useGeminiLive';

export interface AudioLayerRefs {
    rmsRef: HTMLSpanElement | null;
    srRef: HTMLSpanElement | null;
    ctxRef: HTMLSpanElement | null;
    framesRef: HTMLSpanElement | null;
    timeRef: HTMLSpanElement | null; 
}

interface AudioLayerProps extends LayerProps {
    volMultiplier: number;
    setVolMultiplier: (val: number) => void;
}

const AudioLayer = forwardRef<AudioLayerRefs, AudioLayerProps>(({ onExplain, volMultiplier, setVolMultiplier, highlightMap }, ref) => {
    
    const [isEditing, setIsEditing] = useState(false);
    
    // Access the engine tools from the main hook
    // Note: In a stricter architecture, these should be passed as props, 
    // but consuming the hook here is acceptable for this dev-tool overlay context.
    const { getBufferStatus, isJitterEnabled, setIsJitterEnabled } = useGeminiLive();

    const setRef = (key: keyof AudioLayerRefs) => (el: any) => {
        if (ref && typeof ref === 'object' && ref.current) {
            ref.current[key] = el;
        }
    };

    // STANDARDISERAD KNAPP-DESIGN
    const getHighlightClass = (id: string) => {
        const type = highlightMap?.[id];
        // Priority 1: Selected/Highlighted states
        if (type === 'self') return 'ring-2 ring-white bg-slate-700 scale-105 shadow-xl z-20';
        if (type === 'incoming') return 'ring-1 ring-blue-500 bg-blue-500/20';
        if (type === 'outgoing') return 'ring-1 ring-yellow-500 bg-yellow-500/20';
        
        // Priority 2: Default State (Consistent across all grids)
        return 'bg-slate-900/50 hover:bg-slate-800';
    };

    const safeVol = typeof volMultiplier === 'number' ? volMultiplier : 1.0;

    return (
        <div className="bg-slate-900/40 border-b border-violet-500/20 pb-2">
            <div className="grid grid-cols-6 gap-2 text-center mb-4">
                {/* METRICS */}
                <div className={`rounded p-1 cursor-pointer transition-all duration-200 ${getHighlightClass('RMS')}`} onClick={() => onExplain('RMS')}>
                    <div className="text-violet-400/70 text-[10px] font-bold">RMS</div>
                    <span ref={setRef('rmsRef')} className="text-white font-mono text-sm">0.00</span>
                </div>
                <div className={`rounded p-1 cursor-pointer transition-all duration-200 ${getHighlightClass('SR')}`} onClick={() => onExplain('SR')}>
                    <div className="text-violet-400/70 text-[10px] font-bold">SR</div>
                    <span ref={setRef('srRef')} className="text-white text-xs font-mono">---</span>
                </div>
                <div className={`rounded p-1 cursor-pointer transition-all duration-200 ${getHighlightClass('CTX')}`} onClick={() => onExplain('CTX')}>
                    <div className="text-violet-400/70 text-[10px] font-bold">CTX</div>
                    <span ref={setRef('ctxRef')} className="text-white text-xs font-mono">---</span>
                </div>
                <div className={`rounded p-1 cursor-pointer transition-all duration-200 ${getHighlightClass('FRM')}`} onClick={() => onExplain('FRM')}>
                    <div className="text-violet-400/70 text-[10px] font-bold">FRM</div>
                    <span ref={setRef('framesRef')} className="text-white text-sm font-mono">0</span>
                </div>
                <div className={`rounded p-1 cursor-pointer transition-all duration-200 ${getHighlightClass('TIME')}`} onClick={() => onExplain('TIME')}>
                    <div className="text-violet-400/70 text-[10px] font-bold">TIME</div>
                    <span ref={setRef('timeRef')} className="text-indigo-400 font-mono text-sm">0.0</span>
                </div>

                {/* CONFIG BUTTON (C_VOL) */}
                <div 
                    className={`rounded p-1 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${isEditing ? 'bg-violet-900/30 ring-1 ring-violet-500' : getHighlightClass('C_VOL')}`}
                    onClick={() => { onExplain('C_VOL'); setIsEditing(!isEditing); }}
                >
                    <div className="text-violet-400 font-bold text-[10px]">C_VOL</div>
                    <div className="text-white text-sm font-mono">{safeVol.toFixed(1)}x</div>
                </div>

                {/* SLIDER OVERLAY */}
                {isEditing && (
                    <div className="col-span-6 bg-slate-800/90 p-2 rounded-lg border border-violet-500/30 mt-2 mb-1 animate-in slide-in-from-top-1 z-30 shadow-2xl">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold text-violet-300">JUSTERA VOLYM (GAIN)</span>
                            <span className="text-[10px] font-mono text-white">{safeVol.toFixed(1)}x</span>
                        </div>
                        <input 
                            type="range" 
                            min="1.0" 
                            max="5.0" 
                            step="0.5" 
                            value={safeVol} 
                            onChange={(e) => setVolMultiplier(parseFloat(e.target.value))} 
                            className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-violet-500"
                        />
                    </div>
                )}
            </div>

            {/* --- NEW ENGINE TOOLS --- */}
            <div className="space-y-4 px-1">
                {getBufferStatus && (
                    <BufferVisualizer getBufferStatus={getBufferStatus} />
                )}
                {setIsJitterEnabled && (
                    <JitterSimulator isEnabled={isJitterEnabled} setIsEnabled={setIsJitterEnabled} />
                )}
            </div>
        </div>
    );
});

export default AudioLayer;
