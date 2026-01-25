
import React, { forwardRef, useState } from 'react';

export interface TowerPhasesRefs {
    mic: HTMLDivElement | null;
    upBuf: HTMLDivElement | null;
    upBar: HTMLDivElement | null; // Input Buffer Bar
    aiIn: HTMLDivElement | null;  // NEW: Input/Thinking
    aiOut: HTMLDivElement | null; // NEW: Output/Generating
    downBuf: HTMLDivElement | null;
    downBar: HTMLDivElement | null; // Output Buffer Bar
    spk: HTMLDivElement | null;
}

interface TowerPhasesProps {
    onSelect?: (key: string) => void;
}

const TowerPhases = forwardRef<TowerPhasesRefs, TowerPhasesProps>(({ onSelect }, ref) => {
    const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

    const setRef = (key: keyof TowerPhasesRefs) => (el: any) => {
        if (ref && typeof ref === 'object' && ref.current) {
            ref.current[key] = el;
        }
    };

    const handleBoxClick = (id: string, mapToKey?: string) => {
        setActiveTooltip(activeTooltip === id ? null : id);
        // Trigger external select if a mapping key is provided
        if (onSelect && mapToKey) {
            onSelect(mapToKey);
        }
    };

    const PhaseBox = ({ 
        id, label, rKey, barKey, color, icon, description, detail, isBuffer, mapToKey 
    }: { 
        id: string, label: string, rKey: keyof TowerPhasesRefs, barKey?: keyof TowerPhasesRefs, 
        color: string, icon: React.ReactNode, description: string, detail: string, isBuffer?: boolean, mapToKey: string
    }) => (
        <div className="relative flex flex-col items-center">
            {/* CONNECTOR LINE (Left of box, except first one) */}
            {id !== 'MIC' && (
                <div className="absolute top-1/2 -left-3 w-3 h-0.5 bg-slate-800 -z-10"></div>
            )}

            <button 
                ref={setRef(rKey)} 
                onClick={() => handleBoxClick(id, mapToKey)}
                className={`group relative flex flex-col items-center justify-center w-full h-24 rounded-lg border border-slate-800 bg-slate-950 overflow-hidden outline-none transition-all duration-300 ${activeTooltip === id ? 'ring-2 ring-indigo-500 bg-slate-900' : ''}`}
            >
                {/* PROGRESS BAR (Only for buffers) - Added transition-height for smoothness */}
                {barKey && (
                    <div className="absolute bottom-0 left-0 right-0 bg-opacity-20 z-0 flex items-end justify-center h-full pointer-events-none">
                        <div 
                            ref={setRef(barKey)} 
                            className={`w-full bg-current opacity-30 transition-all duration-300 ease-out ${color}`} 
                            style={{ height: '0%' }}
                        ></div>
                    </div>
                )}

                {/* ACTIVE GLOW RING (Controlled by Tower.tsx via class manipulation) */}
                <div className="absolute inset-0 rounded-lg ring-2 ring-offset-0 ring-transparent transition-all duration-500 pointer-events-none active-ring z-10"></div>
                
                {/* CONTENT - Added transition-opacity */}
                <div className={`relative z-10 text-xl mb-1 ${color} transition-all duration-300 icon-container opacity-30 scale-95`}>{icon}</div>
                <div className={`relative z-10 text-[9px] font-black uppercase tracking-widest ${color} mb-0.5 label-id opacity-40 transition-opacity duration-300`}>{id}</div>
                <div className="relative z-10 text-[8px] text-slate-500 text-center font-bold label-text transition-colors duration-300">{label}</div>
            </button>

            {/* CLICK TOOLTIP */}
            {activeTooltip === id && (
                <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-48 bg-slate-900 border border-slate-600 p-3 rounded-lg shadow-2xl z-[100] animate-in fade-in zoom-in-95 duration-200">
                    <div className={`text-[10px] font-bold ${color} mb-1 uppercase tracking-wide`}>{label}</div>
                    <p className="text-[10px] text-slate-200 leading-relaxed mb-2 font-medium">{description}</p>
                    <div className={`text-[9px] font-mono p-1.5 rounded bg-slate-800 ${color} border border-slate-700`}>
                        {detail}
                    </div>
                    {/* Arrow */}
                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border-t border-l border-slate-600 transform rotate-45"></div>
                </div>
            )}
        </div>
    );

    return (
        <div className="w-full bg-slate-900/20 rounded-2xl border border-slate-800 p-1 mb-6">
            <div className="flex justify-between items-center px-4 py-2 border-b border-slate-800/50 mb-2">
                <span className="font-bold text-slate-400 text-[10px] uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                    Audio Pipeline
                </span>
                <span className="text-[9px] text-slate-600">Klicka för info</span>
            </div>

            <div className="grid grid-cols-6 gap-2 p-2">
                
                {/* 1. MICROPHONE -> Maps to 'RMS' (Audio) or 'VAD' (Logic) */}
                <PhaseBox 
                    id="MIC" 
                    label="Input" 
                    rKey="mic" 
                    color="text-green-400"
                    mapToKey="VAD" 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>}
                    description="Fångar ljud. Lyser grönt när du pratar och VAD triggas."
                    detail="Fas 1 (Recording)"
                />
                
                {/* 2. UPLOAD BUFFER -> Maps to 'BUF' */}
                <PhaseBox 
                    id="BUF_IN" 
                    label="Kön" 
                    rKey="upBuf"
                    barKey="upBar"
                    isBuffer
                    color="text-yellow-400"
                    mapToKey="BUF"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>}
                    description="Här samlas ljudpaketen innan de skickas till molnet. Om nätverket är långsamt stiger stapeln."
                    detail="Upload Queue"
                />
                
                {/* 3a. AI INPUT (THINKING) -> Maps to 'BSY' or 'INF' */}
                <PhaseBox 
                    id="AI_IN" 
                    label="Analys" 
                    rKey="aiIn"
                    color="text-fuchsia-400"
                    mapToKey="BSY"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>}
                    description="AI:n bearbetar indata och förbereder svar. Prediktionsmodellen (BSY) styr denna."
                    detail="Thinking / BSY"
                />

                {/* 3b. AI OUTPUT (GENERATING) -> Maps to 'RX' */}
                <PhaseBox 
                    id="AI_OUT" 
                    label="Genererar" 
                    rKey="aiOut"
                    color="text-pink-400"
                    mapToKey="RX"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                    description="AI:n skickar ljuddata (streamar) tillbaka till oss."
                    detail="Generating / RX"
                />

                {/* 4. DOWNLOAD BUFFER -> Maps to 'GAP' */}
                <PhaseBox 
                    id="BUF_OUT" 
                    label="Jitter Buf" 
                    rKey="downBuf"
                    barKey="downBar"
                    isBuffer
                    color="text-blue-400"
                    mapToKey="GAP"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>}
                    description="Jitter Buffer. Tar emot en 'Burst' från AI och spelar upp det i jämn takt."
                    detail="Jitter Buffer"
                />

                {/* 5. SPEAKER -> Maps to 'SPK' */}
                <PhaseBox 
                    id="SPK" 
                    label="Output" 
                    rKey="spk" 
                    color="text-indigo-400"
                    mapToKey="SPK"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>}
                    description="Uppspelning i dina hörlurar/högtalare."
                    detail="Playback"
                />

            </div>
        </div>
    );
});

export default TowerPhases;
