
import React, { forwardRef, useState } from 'react';
import { HighlightType } from '../types';
import { QueueStats } from '../../../types';

// We keep the interface for TS compatibility but relying on IDs now
export interface LogicMetricsRefs {}

interface LogicMetricsProps {
    onExplain: (key: string) => void;
    vadThreshold: number; setVadThreshold: (val: number) => void;
    silenceThreshold: number; setSilenceThreshold: (val: number) => void;
    elasticityStart: number; setElasticityStart: (val: number) => void;
    minTurnDuration: number; setMinTurnDuration: (val: number) => void;
    minSpeechDuration: number; setMinSpeechDuration: (val: number) => void;
    autoSleepTimeout: number; setAutoSleepTimeout: (val: number) => void;
    coldStartSamples: number; setColdStartSamples: (val: number) => void;
    momentumStart: number; setMomentumStart: (val: number) => void;
    ghostTolerance: number; setGhostTolerance: (val: number) => void;
    aiSpeakingRate: number; setAiSpeakingRate: (val: number) => void;
    highlightMap?: Record<string, HighlightType>;
    
    // NEW for Tri-Velocity
    queueStats?: QueueStats;
    currentPlaybackRate?: number;
}

// Sub-components with ID prop
const MetricItem = ({ id, domId, label, onExplain, highlightClass, labelColor = "text-slate-500" }: any) => (
    <div className={`rounded p-1 cursor-pointer flex flex-col items-center justify-center min-h-[40px] transition-all duration-200 ${highlightClass}`} onClick={() => onExplain(id)}>
        <div className={`${labelColor} text-[10px] font-bold uppercase tracking-wider`}>{label}</div>
        <span id={domId} className="text-white text-sm font-mono leading-none mt-1 min-w-[40px] text-center inline-block">---</span>
    </div>
);

const LargeMetricItem = ({ id, domId, label, onExplain, highlightClass, labelColor = "text-slate-500" }: any) => (
    <div className={`col-span-2 rounded p-2 cursor-pointer flex flex-col items-center justify-center min-h-[50px] transition-all duration-200 ${highlightClass}`} onClick={() => onExplain(id)}>
        <div className={`${labelColor} text-[11px] font-black uppercase tracking-widest`}>{label}</div>
        <span id={domId} className="text-white text-xl font-mono leading-none mt-1 font-bold min-w-[60px] text-center inline-block">---</span>
    </div>
);

const ConfigItem = ({ id, label, value, unit, onExplain, setEditKey, isEditing, highlightClass, color = "text-emerald-400" }: any) => (
    <div 
        className={`rounded p-1 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[40px] ${isEditing ? 'bg-emerald-900/30 ring-1 ring-emerald-500' : highlightClass}`}
        onClick={() => { onExplain(id); setEditKey(id); }}
    >
        <div className={`${color} text-[10px] font-bold uppercase tracking-wider`}>{label}</div>
        <div className="text-white text-sm font-mono leading-none mt-1 whitespace-nowrap">
            {value}<span className="text-[9px] text-slate-500 ml-0.5">{unit}</span>
        </div>
    </div>
);

const Header = ({ text, color, id, isOpen, onToggle }: any) => (
    <div 
        onClick={() => onToggle(id)}
        className={`col-span-4 flex justify-between items-center cursor-pointer border-b border-slate-800 pb-0.5 mt-3 mb-1 pl-1 select-none group hover:bg-slate-800/30 rounded px-1 transition-colors`}
    >
        <span className={`text-[10px] font-bold ${color} uppercase tracking-widest`}>{text}</span>
        <span className="text-[9px] text-slate-600 font-mono group-hover:text-slate-400">
            {isOpen ? '[-]' : '[+]'}
        </span>
    </div>
);

const Slider = ({ min, max, step, value, onChange, labelKey }: { min: number, max: number, step: number, value: number, onChange: (val: number) => void, labelKey: string }) => (
    <div className="col-span-4 bg-slate-800/90 p-2 rounded-lg border border-emerald-500/30 mt-1 mb-1 animate-in slide-in-from-top-1 z-30 shadow-2xl">
            <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold text-emerald-300">JUSTERA {labelKey?.replace('C_','')}</span>
            <span className="text-[10px] font-mono text-white">{value}</span>
        </div>
        <input 
            type="range" min={min} max={max} step={step} value={value} 
            onChange={(e) => onChange(parseFloat(e.target.value))} 
            className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
    </div>
);

const LogicMetrics = forwardRef<LogicMetricsRefs, LogicMetricsProps>(({ 
    onExplain,
    vadThreshold, setVadThreshold,
    silenceThreshold, setSilenceThreshold,
    elasticityStart, setElasticityStart,
    minTurnDuration, setMinTurnDuration,
    minSpeechDuration, setMinSpeechDuration,
    autoSleepTimeout, setAutoSleepTimeout,
    coldStartSamples, setColdStartSamples,
    momentumStart, setMomentumStart,
    ghostTolerance, setGhostTolerance,
    aiSpeakingRate, setAiSpeakingRate,
    highlightMap,
    queueStats,
    currentPlaybackRate
}, ref) => {
    
    const [editKey, setEditKey] = useState<string | null>(null);
    const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({
        momentum: true // Default collapsed
    });

    const toggleGroup = (id: string) => {
        setCollapsedGroups(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const getHighlightClass = (id: string) => {
        const type = highlightMap?.[id];
        if (type === 'self') return 'ring-2 ring-white bg-slate-800 scale-105 shadow-xl z-20';
        if (type === 'incoming') return 'ring-1 ring-blue-500 bg-blue-500/10';
        if (type === 'outgoing') return 'ring-1 ring-yellow-500 bg-yellow-500/10';
        return 'bg-slate-900/50 hover:bg-slate-800';
    };

    const handleEditToggle = (id: string) => {
        setEditKey(prev => prev === id ? null : id);
    };

    const safeVad = typeof vadThreshold === 'number' ? vadThreshold : 0.5;

    // Helper to check open state
    const isOpen = (key: string) => !collapsedGroups[key];

    // --- TRI-VELOCITY LOGIC (Visual Only) ---
    // Calculated locally for visualization based on props
    // NOTE: This tries to read the DOM element if props aren't live enough, but uses stats first
    const jitterGap = queueStats ? Math.abs(queueStats.bufferGap) : 0;
    
    // Hacky way to get Dam Size from DOM if not passed (since it's a ref in main logic)
    // In a real app we would pass this via props, but for visualization:
    let damSize = 0;
    try {
        const damEl = document.getElementById('disp-dam');
        if(damEl) damSize = parseInt(damEl.innerText) || 0;
    } catch(e) {}
    
    const damSeconds = damSize * 0.128; // approx
    const totalLatency = jitterGap + damSeconds;
    
    // 1. PERSONA (Server)
    let personaSpeed = aiSpeakingRate; 
    let personaLabel = "NORMAL";
    if (totalLatency > 25.0) { personaSpeed = 1.3; personaLabel = "ROCKET"; }
    else if (totalLatency > 15.0) { personaSpeed = 1.2; personaLabel = "FAST"; }

    // 3. LERP (Micro) - ALWAYS ON (Base 0% -> 2% at 15s)
    let lerpSpeed = 1.0 + (Math.min(totalLatency, 25.0) / 25.0) * 0.02;

    // 2. WSOLA (Macro) - NEW LOGIC (5s Steps)
    let wsolaSpeed = 1.0;
    if (totalLatency > 20.0) wsolaSpeed = 1.30;
    else if (totalLatency > 15.0) wsolaSpeed = 1.20;
    else if (totalLatency > 10.0) wsolaSpeed = 1.10;
    else if (totalLatency > 5.0) wsolaSpeed = 1.05;
    else wsolaSpeed = 1.00;

    const totalSpeed = personaSpeed * wsolaSpeed * lerpSpeed;

    return (
        <div className="p-3 grid grid-cols-4 gap-y-2 gap-x-2 bg-slate-900/50">
            
            {/* AI PERCEPTION */}
            <Header text="AI Perception (Input)" color="text-fuchsia-500/70" id="perception" isOpen={isOpen('perception')} onToggle={toggleGroup} />
            
            {isOpen('perception') && (
                <>
                    <LargeMetricItem id="VAD" domId="disp-vad" label="VAD" onExplain={onExplain} highlightClass={getHighlightClass("VAD")} labelColor="text-fuchsia-400" />
                    
                    <MetricItem id="THR" domId="disp-thr" label="THR" onExplain={onExplain} highlightClass={getHighlightClass("THR")} labelColor="text-fuchsia-400" />
                    <MetricItem id="V_AVG" domId="disp-avg" label="AVG" onExplain={onExplain} highlightClass={getHighlightClass("V_AVG")} labelColor="text-fuchsia-400" />
                    
                    <ConfigItem id="C_THR" label="C_THR" value={(safeVad * 100).toFixed(0)} unit="%" onExplain={onExplain} setEditKey={handleEditToggle} isEditing={editKey === 'C_THR'} highlightClass={getHighlightClass("C_THR")} color="text-fuchsia-400" />
                    <ConfigItem id="C_MSD" label="C_MSD" value={minSpeechDuration} unit="ms" onExplain={onExplain} setEditKey={handleEditToggle} isEditing={editKey === 'C_MSD'} highlightClass={getHighlightClass("C_MSD")} color="text-fuchsia-400" />
                    
                    <ConfigItem id="C_CSL" label="C_CSL" value={coldStartSamples} unit="turer" onExplain={onExplain} setEditKey={handleEditToggle} isEditing={editKey === 'C_CSL'} highlightClass={getHighlightClass("C_CSL")} color="text-fuchsia-400" />
                    <MetricItem id="CS_M" domId="disp-csm" label="CS_M" onExplain={onExplain} highlightClass={getHighlightClass("CS_M")} labelColor="text-fuchsia-400" />

                    {editKey === 'C_THR' && <Slider min={0.1} max={0.9} step={0.05} value={safeVad} onChange={setVadThreshold} labelKey="C_THR" />}
                    {editKey === 'C_MSD' && <Slider min={50} max={500} step={10} value={minSpeechDuration} onChange={(val) => setMinSpeechDuration(val)} labelKey="C_MSD" />}
                    {editKey === 'C_CSL' && <Slider min={1} max={20} step={1} value={coldStartSamples} onChange={setColdStartSamples} labelKey="C_CSL" />}

                    {/* MODEL INTERNALS */}
                    <div className="col-span-4 grid grid-cols-4 gap-2 bg-fuchsia-900/10 p-2 rounded border border-fuchsia-500/20 mt-1">
                        <div className="col-span-4 text-[8px] font-bold text-fuchsia-400 uppercase tracking-widest text-center">Prediction Model Internals</div>
                        <div className="col-span-1 text-center cursor-pointer hover:bg-fuchsia-500/10 rounded" onClick={() => onExplain('P_RATE')}>
                            <div className="text-[8px] text-fuchsia-300">RATE</div>
                            <span id="disp-prate" className="font-mono text-[10px] text-white font-bold inline-block min-w-[20px]">1.0</span>
                        </div>
                        <div className="col-span-1 text-center cursor-pointer hover:bg-fuchsia-500/10 rounded" onClick={() => onExplain('P_OH')}>
                            <div className="text-[8px] text-fuchsia-300">OVHD</div>
                            <span id="disp-poh" className="font-mono text-[10px] text-white font-bold inline-block min-w-[25px]">800</span>
                        </div>
                        <div className="col-span-2 text-center cursor-pointer hover:bg-fuchsia-500/10 rounded" onClick={() => onExplain('P_SAF')}>
                            <div className="text-[8px] text-fuchsia-300">MARGIN (2σ)</div>
                            <span id="disp-psaf" className="font-mono text-[10px] text-white font-bold inline-block min-w-[30px]">2000</span>
                        </div>
                    </div>
                </>
            )}

            {/* LOGIC & SHIELD */}
            <Header text="Logic & Shield (Protection)" color="text-emerald-500/70" id="logic" isOpen={isOpen('logic')} onToggle={toggleGroup} />
            
            {isOpen('logic') && (
                <>
                    <LargeMetricItem id="SPK" domId="disp-spk" label="SPK" onExplain={onExplain} highlightClass={getHighlightClass("SPK")} labelColor="text-emerald-400" />

                    <div className={`col-span-2 grid grid-cols-2 gap-1 rounded transition-all`}>
                        <div className={`rounded p-1 cursor-pointer flex flex-col items-center justify-center ${getHighlightClass('SIL')}`} onClick={() => onExplain('SIL')}>
                            <div className="text-emerald-400 text-[10px] font-bold">SIL</div>
                            <span id="disp-sil" className="text-white text-sm font-mono inline-block min-w-[40px] text-center">0.0s</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className={`flex-1 rounded p-0.5 cursor-pointer flex items-center justify-between px-2 ${getHighlightClass('SQZ')}`} onClick={() => onExplain('SQZ')}>
                                <span className="text-[9px] text-emerald-400 font-bold">SQZ</span>
                                <span id="disp-sqz" className="font-bold text-[10px] font-mono">IDLE</span>
                            </div>
                            <div className={`flex-1 rounded p-0.5 cursor-pointer flex items-center justify-between px-2 ${getHighlightClass('PUP')}`} onClick={() => onExplain('PUP')}>
                                <span className="text-[9px] text-violet-400 font-bold">PUP</span>
                                <span id="disp-pup" className="font-bold text-[10px] font-mono text-slate-500">IDLE</span>
                            </div>
                        </div>
                    </div>
                    
                    <MetricItem id="BSY" domId="disp-bsy" label="BSY" onExplain={onExplain} highlightClass={getHighlightClass("BSY")} labelColor="text-yellow-400" />
                    
                    <div className={`rounded p-1 cursor-pointer flex flex-col items-center justify-center min-h-[40px] transition-all duration-200 ${getHighlightClass('SHLD')}`} onClick={() => onExplain('SHLD')}>
                        <div className="text-red-400 text-[10px] font-bold uppercase tracking-wider">SHLD</div>
                        <span id="disp-shld" className="text-white text-sm font-mono leading-none mt-1 font-black inline-block min-w-[40px] text-center">---</span>
                    </div>
                    
                    <ConfigItem id="C_SIL" label="C_SIL (BAS)" value={silenceThreshold} unit="ms" onExplain={onExplain} setEditKey={handleEditToggle} isEditing={editKey === 'C_SIL'} highlightClass={getHighlightClass("C_SIL")} />
                    <ConfigItem id="C_ELA" label="C_ELA" value={elasticityStart} unit="s" onExplain={onExplain} setEditKey={handleEditToggle} isEditing={editKey === 'C_ELA'} highlightClass={getHighlightClass("C_ELA")} />

                    {editKey === 'C_SIL' && <Slider min={200} max={2000} step={25} value={silenceThreshold} onChange={(val) => setSilenceThreshold(val)} labelKey="C_SIL" />}
                    {editKey === 'C_ELA' && <Slider min={2.0} max={15.0} step={0.5} value={elasticityStart} onChange={setElasticityStart} labelKey="C_ELA" />}
                </>
            )}

            {/* MOMENTUM */}
            <Header text="Momentum & Ghost Pressure" color="text-fuchsia-500/70" id="momentum" isOpen={isOpen('momentum')} onToggle={toggleGroup} />
            
            {isOpen('momentum') && (
                <>
                    <MetricItem id="GHOST" domId="disp-ghost" label="GHOST" onExplain={onExplain} highlightClass={getHighlightClass("GHOST")} labelColor="text-fuchsia-400" />
                    
                    <ConfigItem id="C_MOM" label="C_MOM" value={momentumStart.toFixed(1)} unit="s" onExplain={onExplain} setEditKey={handleEditToggle} isEditing={editKey === 'C_MOM'} highlightClass={getHighlightClass("C_MOM")} color="text-fuchsia-400" />
                    <ConfigItem id="C_MTR" label="C_MTR" value={ghostTolerance} unit="ms" onExplain={onExplain} setEditKey={handleEditToggle} isEditing={editKey === 'C_MTR'} highlightClass={getHighlightClass("C_MTR")} color="text-fuchsia-400" />
                    
                    {editKey === 'C_MOM' && <Slider min={1.0} max={10.0} step={0.5} value={momentumStart} onChange={setMomentumStart} labelKey="C_MOM" />}
                    {editKey === 'C_MTR' && <Slider min={500} max={2500} step={50} value={ghostTolerance} onChange={setGhostTolerance} labelKey="C_MTR" />}
                </>
            )}

            {/* TRANSPORT */}
            <Header text="Transport & Flow" color="text-sky-500/70" id="transport" isOpen={isOpen('transport')} onToggle={toggleGroup} />
            
            {isOpen('transport') && (
                <>
                    {/* TRI-VELOCITY DASHBOARD (Inserted Here) */}
                    <div className="col-span-4 bg-slate-900/50 p-2 rounded-lg border border-slate-800 mb-2">
                        <div className="flex justify-between items-center mb-2 px-1">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Tri-Velocity Engine</span>
                            <span className="text-[10px] font-mono font-bold text-white">
                                TOTAL: <span className={totalSpeed > 1.1 ? "text-green-400" : "text-slate-300"}>{totalSpeed.toFixed(2)}x</span>
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2">
                            {/* PERSONA */}
                            <div onClick={() => onExplain('VEL_PER')} className="bg-slate-950 p-2 rounded border border-slate-800 flex flex-col items-center cursor-pointer hover:bg-slate-900 transition-colors group">
                                <div className="text-[8px] font-bold text-fuchsia-500 mb-1">PERSONA</div>
                                <div className="h-10 w-full bg-slate-900 rounded relative overflow-hidden mb-1">
                                    <div className="absolute bottom-0 w-full bg-fuchsia-600 transition-all duration-500 group-hover:bg-fuchsia-500" style={{ height: `${(personaSpeed - 0.5) / 1.5 * 100}%` }}></div>
                                </div>
                                <div className="text-[9px] font-mono text-white">{personaLabel}</div>
                                <div className="text-[8px] text-slate-500">{personaSpeed.toFixed(1)}x</div>
                            </div>

                            {/* WSOLA */}
                            <div onClick={() => onExplain('VEL_WSO')} className="bg-slate-950 p-2 rounded border border-slate-800 flex flex-col items-center cursor-pointer hover:bg-slate-900 transition-colors group">
                                <div className="text-[8px] font-bold text-cyan-500 mb-1">WSOLA</div>
                                <div className="h-10 w-full bg-slate-900 rounded relative overflow-hidden mb-1">
                                    <div className="absolute bottom-0 w-full bg-cyan-600 transition-all duration-300 group-hover:bg-cyan-500" style={{ height: `${(wsolaSpeed - 1.0) / 0.5 * 100}%` }}></div>
                                </div>
                                <div className="text-[9px] font-mono text-white">{wsolaSpeed.toFixed(2)}x</div>
                                <div className="text-[8px] text-slate-500">Macro</div>
                            </div>

                            {/* LERP */}
                            <div onClick={() => onExplain('VEL_LRP')} className="bg-slate-950 p-2 rounded border border-slate-800 flex flex-col items-center cursor-pointer hover:bg-slate-900 transition-colors group">
                                <div className="text-[8px] font-bold text-green-500 mb-1">LERP</div>
                                <div className="h-10 w-full bg-slate-900 rounded relative overflow-hidden mb-1">
                                    <div className={`absolute bottom-0 w-full bg-green-500 transition-all duration-300 animate-pulse`} style={{ height: `${(lerpSpeed - 1.0) / 0.05 * 100}%`, minHeight: '5%' }}></div>
                                </div>
                                <div className="text-[9px] font-mono text-white">{lerpSpeed.toFixed(3)}x</div>
                                <div className="text-[8px] text-slate-500">Smoothing</div>
                            </div>
                        </div>
                    </div>

                    {/* DAM & BUF */}
                    <div className={`rounded p-1 cursor-pointer flex flex-col items-center justify-center min-h-[40px] transition-all duration-200 ${getHighlightClass('DAM')}`} onClick={() => onExplain('DAM')}>
                        <div className="text-blue-400 text-[10px] font-bold uppercase tracking-wider">DAM</div>
                        <span id="disp-dam" className="text-white text-sm font-mono leading-none mt-1 font-bold inline-block min-w-[20px] text-center">0</span>
                    </div>
                    <div className={`rounded p-1 cursor-pointer flex flex-col items-center justify-center min-h-[40px] transition-all duration-200 ${getHighlightClass('BUF')}`} onClick={() => onExplain('BUF')}>
                        <div className="text-blue-400 text-[10px] font-bold uppercase tracking-wider">BUF</div>
                        <span id="disp-buf" className="text-white text-sm font-mono leading-none mt-1 inline-block min-w-[20px] text-center">0</span>
                    </div>
                    
                    <LargeMetricItem id="GAP" domId="disp-gap" label="GAP" onExplain={onExplain} highlightClass={getHighlightClass("GAP")} labelColor="text-sky-400" />

                    <MetricItem id="RTT" domId="disp-rtt" label="RTT" onExplain={onExplain} highlightClass={getHighlightClass("RTT")} labelColor="text-sky-400" />
                    <MetricItem id="Q_LN" domId="disp-qln" label="Q_LN" onExplain={onExplain} highlightClass={getHighlightClass("Q_LN")} labelColor="text-sky-400" />
                    <MetricItem id="LTC" domId="disp-lat" label="LTC" onExplain={onExplain} highlightClass={getHighlightClass("LTC")} labelColor="text-sky-400" />
                    <MetricItem id="ASLP" domId="disp-aslp" label="ASLP" onExplain={onExplain} highlightClass={getHighlightClass("ASLP")} labelColor="text-sky-400" />
                    
                    <ConfigItem id="C_LAT" label="C_LAT" value={minTurnDuration} unit="ms" onExplain={onExplain} setEditKey={handleEditToggle} isEditing={editKey === 'C_LAT'} highlightClass={getHighlightClass("C_LAT")} color="text-sky-400" />
                    <ConfigItem id="C_SPD" label="C_SPD" value={aiSpeakingRate} unit="x" onExplain={onExplain} setEditKey={handleEditToggle} isEditing={editKey === 'C_SPD'} highlightClass={getHighlightClass("C_SPD")} color="text-sky-400" />

                    {editKey === 'C_LAT' && <Slider min={200} max={2000} step={100} value={minTurnDuration} onChange={(val) => setMinTurnDuration(val)} labelKey="C_LAT" />}
                    {editKey === 'C_SPD' && <Slider min={0.5} max={2.0} step={0.1} value={aiSpeakingRate} onChange={setAiSpeakingRate} labelKey="C_SPD" />}
                </>
            )}
            
            {/* HIDDEN REFS (Kept for compatibility, but not used) */}
            <div className="hidden">
               <span id="disp-lts"></span>
               <span id="disp-cnb"></span>
               <span id="disp-inf"></span>
               <span id="disp-mode"></span>
               <span id="disp-vst"></span>
            </div>
        </div>
    );
});

export default LogicMetrics;
