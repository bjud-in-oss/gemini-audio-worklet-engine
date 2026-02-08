
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { DiagnosticData, HighlightType } from './tower/types';
import NetworkLayer, { NetworkLayerRefs } from './tower/NetworkLayer';
import LogicLayer, { LogicLayerRefs } from './tower/LogicLayer';
import AudioLayer, { AudioLayerRefs } from './tower/AudioLayer';
import TowerSettings from './tower/TowerSettings';
import TowerInfo from './tower/TowerInfo';
import TowerDoctor from './tower/TowerDoctor';
import TowerOverview from './tower/TowerOverview';
import TowerMaintenance from './tower/TowerMaintenance';
import TowerPhases, { TowerPhasesRefs } from './tower/TowerPhases';
import LogicGraph from './tower/logic/LogicGraph';
import { TowerProvider } from './tower/TowerContext';
import { KNOWLEDGE_BASE } from './tower/TowerKnowledge';
import { QueueStats } from '../types';

interface TowerProps {
    diagnosticsRef: React.MutableRefObject<DiagnosticData>;
    isConnected: boolean;
    triggerTestTone: () => void;
    injectTextAsAudio: (text: string) => Promise<string>;
    initAudioInput: () => Promise<void>; 
    
    // STATS
    queueStats: QueueStats;
    currentPlaybackRate: number;

    aiSpeakingRate: number;
    setAiSpeakingRate: (val: number) => void;
    minTurnDuration: number;
    setMinTurnDuration: (val: number) => void;
    vadThreshold: number;
    setVadThreshold: (val: number) => void;
    silenceThreshold: number; 
    setSilenceThreshold: (val: number) => void; 
    
    elasticityStart: number;
    setElasticityStart: (val: number) => void;
    minSpeechDuration: number;
    setMinSpeechDuration: (val: number) => void;
    
    coldStartSamples: number;
    setColdStartSamples: (val: number) => void;

    // NEW: GHOST PRESSURE PROPS
    momentumStart: number;
    setMomentumStart: (val: number) => void;
    ghostTolerance: number;
    setGhostTolerance: (val: number) => void;

    volMultiplier: number; 
    setVolMultiplier: (val: number) => void; 
    
    autoSleepTimeout: number;
    setAutoSleepTimeout: (val: number) => void;

    inputDeviceId?: string;
    setInputDeviceId?: (val: string) => void;
    outputDeviceId?: string;
    setOutputDeviceId?: (val: string) => void;
    
    // NEW: Pro Mode Toggle
    enableProMode?: boolean;
    setEnableProMode?: (val: boolean) => void;

    debugMode: boolean;
    setDebugMode: (val: boolean) => void;
    onOpenCalibration: () => void;
    
    connect: () => Promise<void>;
    disconnect: () => void;
    setCustomSystemInstruction: (text: string) => void;
    
    enableLogs: boolean;
    setEnableLogs: (val: boolean) => void;
    onOpenPromptModal: () => void;
    
    simulateNetworkDrop: () => void; 

    // ENGINE TOOLS
    getBufferStatus?: () => { samples: number; ms: number; speed?: number };
    isJitterEnabled?: boolean;
    setIsJitterEnabled?: (val: boolean) => void;
    jitterIntensity?: number;
    setJitterIntensity?: (val: number) => void;
}

const Tower: React.FC<TowerProps> = ({ 
    diagnosticsRef, 
    isConnected, 
    triggerTestTone, 
    injectTextAsAudio,
    initAudioInput,
    queueStats,
    currentPlaybackRate,
    aiSpeakingRate, setAiSpeakingRate,
    minTurnDuration, setMinTurnDuration,
    vadThreshold, setVadThreshold,
    silenceThreshold, setSilenceThreshold,
    elasticityStart, setElasticityStart,
    minSpeechDuration, setMinSpeechDuration,
    coldStartSamples, setColdStartSamples,
    momentumStart, setMomentumStart,
    ghostTolerance, setGhostTolerance,
    volMultiplier, setVolMultiplier,
    autoSleepTimeout, setAutoSleepTimeout,
    inputDeviceId, setInputDeviceId, 
    outputDeviceId, setOutputDeviceId,
    enableProMode, setEnableProMode,
    debugMode, setDebugMode,
    onOpenCalibration,
    connect, disconnect,
    setCustomSystemInstruction,
    enableLogs, setEnableLogs,
    onOpenPromptModal,
    simulateNetworkDrop,
    getBufferStatus,
    isJitterEnabled,
    setIsJitterEnabled,
    jitterIntensity,
    setJitterIntensity
}) => {
    const [selectedInfo, setSelectedInfo] = useState<string | null>(null);
    const [visualsEnabled, setVisualsEnabled] = useState(true); 
    
    const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
        maintenance: true // Default collapsed
    });

    const toggleSection = (key: string) => {
        setCollapsedSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const highlightMap = useMemo(() => {
        const map: Record<string, HighlightType> = {};
        if (!selectedInfo) return map;
        map[selectedInfo] = 'self';
        const entry = KNOWLEDGE_BASE[selectedInfo];
        if (entry) {
            entry.affectedBy.forEach(rel => { map[rel.id] = 'incoming'; });
            entry.affects.forEach(rel => { map[rel.id] = 'outgoing'; });
        }
        return map;
    }, [selectedInfo]);

    const networkRefs = useRef<NetworkLayerRefs>({ wsRef: null, keyRef: null, txRef: null, rxRef: null });
    const audioRefs = useRef<AudioLayerRefs>({ rmsRef: null, srRef: null, ctxRef: null, framesRef: null, timeRef: null });
    const logicRefs = useRef<LogicLayerRefs>({}); 
    
    const graphCanvasRef = useRef<HTMLCanvasElement>(null);

    const phasesRefs = useRef<TowerPhasesRefs>({ 
        mic: null, 
        upBuf: null, upBar: null,
        aiIn: null, aiOut: null,
        downBuf: null, downBar: null,
        spk: null 
    });

    const visualStateRef = useRef({
        bufInHeight: 0,
        bufOutHeight: 0,
        aiActiveCounter: 0,
        rxCounter: 0
    });

    // ... (useEffect for render loop remains largely the same, omitted for brevity but assumed intact) ...
    // Note: Ensuring we keep the existing render logic for VAD graph etc.
    useEffect(() => {
        if (!visualsEnabled) {
            if (graphCanvasRef.current) {
                const ctx = graphCanvasRef.current.getContext('2d');
                if (ctx) ctx.clearRect(0, 0, graphCanvasRef.current.width, graphCanvasRef.current.height);
            }
            return;
        }

        let ctx: CanvasRenderingContext2D | null = null;
        const initCanvas = () => { if (graphCanvasRef.current) ctx = graphCanvasRef.current.getContext('2d'); };
        setTimeout(initCanvas, 100);
        const historySize = 80;
        const vadHistory = new Array(historySize).fill(0);
        let animationFrameId: number;
        
        let lastFrameTime = 0;
        const TARGET_FPS = 30; 
        const FRAME_INTERVAL = 1000 / TARGET_FPS;

        let logicEls: Record<string, HTMLElement | null> = {};

        const getEl = (key: string, id: string) => {
            if (!logicEls[key] || !logicEls[key]?.isConnected) {
                logicEls[key] = document.getElementById(id);
            }
            return logicEls[key];
        };

        const setPhaseState = (key: keyof TowerPhasesRefs, active: boolean, colorClass: string) => {
            const el = phasesRefs.current[key];
            if (!el) return;
            const ring = el.querySelector('.active-ring');
            const icon = el.querySelector('.icon-container');
            const label = el.querySelector('.label-id');
            const text = el.querySelector('.label-text') as HTMLElement | null;
            
            if (active) {
                el.style.backgroundColor = 'rgba(30, 41, 59, 1)'; 
                el.style.borderColor = 'rgba(255,255,255,0.2)';
                if (icon) { 
                    icon.classList.remove('opacity-30', 'scale-95');
                    icon.classList.add('opacity-100', 'scale-110');
                }
                if (label) label.classList.replace('opacity-40', 'opacity-100');
                if (text) { text.style.color = '#fff'; }
                if (ring) {
                    ring.classList.add(colorClass); 
                    ring.classList.remove('ring-transparent');
                }
            } else {
                el.style.backgroundColor = 'rgba(2, 6, 23, 0.5)'; 
                el.style.borderColor = 'rgba(30, 41, 59, 0.5)';
                if (icon) { 
                    icon.classList.remove('opacity-100', 'scale-110');
                    icon.classList.add('opacity-30', 'scale-95');
                }
                if (label) label.classList.replace('opacity-100', 'opacity-40');
                if (text) { text.style.color = '#64748b'; }
                if (ring) {
                    ring.classList.remove(colorClass);
                    ring.classList.add('ring-transparent');
                }
            }
        };

        const render = (timestamp: number) => {
            animationFrameId = requestAnimationFrame(render);

            const elapsed = timestamp - lastFrameTime;
            if (elapsed < FRAME_INTERVAL) return;
            lastFrameTime = timestamp - (elapsed % FRAME_INTERVAL);

            const data = diagnosticsRef.current;
            const net = networkRefs.current;
            const audio = audioRefs.current;

            if (net.keyRef) { net.keyRef.innerText = (process.env.API_KEY && process.env.API_KEY.length > 5) ? "OK" : "NO"; net.keyRef.className = (process.env.API_KEY && process.env.API_KEY.length > 5) ? "text-green-400 font-bold" : "text-red-500 font-bold"; }
            if (net.wsRef) { net.wsRef.innerText = data.wsState || '---'; net.wsRef.className = data.wsState === 'OPEN' ? 'text-green-400 font-bold text-xs' : 'text-yellow-400 text-xs'; }
            if (net.rxRef) { net.rxRef.style.backgroundColor = data.serverRx ? '#22c55e' : '#1e293b'; net.rxRef.style.boxShadow = data.serverRx ? '0 0 8px #22c55e' : 'none'; }
            if (net.txRef) { net.txRef.style.backgroundColor = data.networkEvent !== 'idle' ? '#3b82f6' : '#1e293b'; }
            
            const vadEl = getEl('vad', 'disp-vad');
            if (vadEl) vadEl.innerText = (data.vadProb * 100).toFixed(0);

            const thrEl = getEl('thr', 'disp-thr');
            if (thrEl) thrEl.innerText = data.vadThreshold.toFixed(2);

            const spkEl = getEl('spk', 'disp-spk');
            if (spkEl) { spkEl.innerText = data.isSpeaking ? 'JA' : 'NEJ'; spkEl.className = data.isSpeaking ? 'text-green-400 font-bold text-base' : 'text-slate-600 text-base'; }

            const silEl = getEl('sil', 'disp-sil');
            if (silEl) { silEl.innerText = data.silenceDuration.toFixed(1) + 's'; const s = data.silenceDuration; silEl.className = s > 110 ? 'text-red-500 font-bold text-xs animate-pulse' : (s > 60 ? 'text-orange-400 text-xs' : 'text-yellow-400 text-xs'); }

            const sqzEl = getEl('sqz', 'disp-sqz');
            if (sqzEl) { const thresh = data.currentSilenceThreshold || data.silenceThreshold || 500; sqzEl.innerText = (thresh/1000).toFixed(2) + 's'; if (thresh < 100) sqzEl.className = 'text-red-500 font-black text-xs animate-pulse bg-red-900/30 px-1 rounded'; else if (thresh < 400) sqzEl.className = 'text-orange-400 font-bold text-xs'; else sqzEl.className = 'text-green-400 font-mono text-xs'; }

            const pupEl = getEl('pup', 'disp-pup');
            if (pupEl) {
                const state = data.puppeteerState || 'IDLE';
                pupEl.innerText = state;
                if (state === 'REPEAT') pupEl.className = 'text-blue-400 animate-pulse font-bold text-[10px] font-mono';
                else if (state === 'FILLER') pupEl.className = 'text-fuchsia-400 animate-pulse font-bold text-[10px] font-mono';
                else if (state === 'CUT') pupEl.className = 'text-red-500 animate-pulse font-black text-[10px] font-mono';
                else pupEl.className = 'text-slate-500 font-bold text-[10px] font-mono';
            }

            const ghostEl = getEl('ghost', 'disp-ghost');
            if (ghostEl) {
                const active = data.ghostActive;
                ghostEl.innerText = active ? "ON" : "OFF";
                ghostEl.className = active ? "text-fuchsia-400 font-bold text-sm font-mono" : "text-slate-500 font-bold text-sm font-mono";
            }

            const gapEl = getEl('gap', 'disp-gap');
            if (gapEl) { const gap = data.bufferGap || 0; gapEl.innerText = gap.toFixed(2) + 's'; gapEl.style.color = Math.abs(gap) > 0.5 ? '#facc15' : '#ffffff'; }

            const bufEl = getEl('buf', 'disp-buf');
            if (bufEl) { const isWarning = data.wsState !== 'OPEN' && data.bufferSize > 5; bufEl.innerText = data.bufferSize.toString(); bufEl.className = isWarning ? 'text-red-400 font-bold text-xs' : 'text-slate-400 text-xs'; }

            const modeEl = getEl('mode', 'disp-mode');
            if (modeEl) { modeEl.innerText = data.activeMode === 'translate' ? 'TRNS' : (data.activeMode === 'off' ? 'OFF' : 'SCRB'); modeEl.className = data.activeMode === 'translate' ? 'text-green-400 font-bold text-xs' : 'text-slate-500 text-xs'; }

            const latEl = getEl('lat', 'disp-lat');
            if (latEl) { const lat = (data.currentLatency || 0) * 1000; latEl.innerText = lat.toFixed(0); latEl.className = lat > 1000 ? 'text-yellow-400 text-xs' : 'text-green-400 text-xs'; }

            const bsyEl = getEl('bsy', 'disp-bsy');
            if (bsyEl) { bsyEl.innerText = Math.max(0, data.busyRemaining || 0).toFixed(0); bsyEl.className = (data.busyRemaining > 0) ? 'text-yellow-400 font-bold text-base' : 'text-slate-600 text-base'; }

            const qlnEl = getEl('qln', 'disp-qln');
            if (qlnEl) { qlnEl.innerText = (data.queueLength || 0).toString(); }

            const aslpEl = getEl('aslp', 'disp-aslp');
            if (aslpEl) { aslpEl.innerText = (data.autoSleepCountdown || 120).toFixed(0) + 's'; }

            const avgEl = getEl('avg', 'disp-avg');
            if (avgEl) { const avg = (data.avgVadProb || 0) * 100; avgEl.innerText = avg.toFixed(0); avgEl.className = avg > 10 ? 'text-red-400 font-bold text-xs' : 'text-slate-500 text-xs'; }

            const rttEl = getEl('rtt', 'disp-rtt');
            if (rttEl) { const rtt = data.rtt || 0; const rttAge = data.rttAge || 0; rttEl.innerText = rtt.toFixed(0) + 'ms'; if (rttAge > 5000) { rttEl.className = 'text-slate-600 font-bold text-base'; } else { rttEl.className = rtt > 1000 ? 'text-red-500 font-bold text-base' : 'text-emerald-400 font-bold text-base'; } }

            const shldEl = getEl('shld', 'disp-shld');
            if (shldEl) {
                const active = data.shieldActive;
                const isActive = active === true;
                shldEl.innerText = isActive ? "LÅST" : "ÖPPEN";
                shldEl.className = isActive 
                    ? 'text-red-500 font-black animate-pulse text-sm font-mono inline-block min-w-[40px] text-center' 
                    : 'text-green-500 font-bold text-sm font-mono inline-block min-w-[40px] text-center';
            }

            const damEl = getEl('dam', 'disp-dam');
            if (damEl) {
                const damSize = data.shieldSize || 0;
                damEl.innerText = damSize.toString();
                damEl.className = damSize > 0 
                    ? 'text-blue-400 font-bold text-sm font-mono leading-none mt-1 inline-block min-w-[20px] text-center animate-pulse'
                    : 'text-white text-sm font-mono leading-none mt-1 font-bold inline-block min-w-[20px] text-center';
            }
            
            const prateEl = getEl('prate', 'disp-prate');
            if (prateEl) prateEl.innerText = (data.modelProcessingRate || 1.0).toFixed(2);
            
            const pohEl = getEl('poh', 'disp-poh');
            if (pohEl) pohEl.innerText = (data.modelFixedOverhead || 800).toFixed(0);
            
            const psafEl = getEl('psaf', 'disp-psaf');
            if (psafEl) psafEl.innerText = (data.modelSafetyMargin || 2000).toFixed(0);
            
            const csmEl = getEl('csm', 'disp-csm');
            if (csmEl) {
                const isCold = data.isColdStart; 
                csmEl.innerText = isCold ? "SAFE" : "ADAPT"; 
                csmEl.className = isCold ? 'text-blue-300 font-bold text-xs' : 'text-purple-400 font-bold text-xs'; 
            }

            if (audio.rmsRef) audio.rmsRef.innerText = data.rms.toFixed(4);
            if (audio.framesRef) audio.framesRef.innerText = (data.framesProcessed % 1000).toString();
            if (audio.ctxRef) { const s = data.audioContextState === 'running' ? 'RUN' : 'SUSP'; audio.ctxRef.innerText = s; audio.ctxRef.className = s === 'RUN' ? 'text-green-400 font-bold text-xs' : 'text-red-400 font-bold text-xs animate-pulse'; }
            if (audio.srRef) { audio.srRef.innerText = (data.sampleRate / 1000).toFixed(0) + 'k'; audio.srRef.className = data.sampleRate === 16000 ? 'text-green-400 font-bold text-xs' : 'text-yellow-400 font-bold text-xs'; }
            if (audio.timeRef) { const t = data.audioContextTime || 0; audio.timeRef.innerText = t.toFixed(1) + 's'; }

            const isMicActive = data.isSpeaking;
            setPhaseState('mic', isMicActive, 'ring-green-500');

            const inputBufferCount = data.bufferSize + data.connectingBufferSize;
            const isUpBufActive = inputBufferCount > 0 || data.inFlightCount > 0;
            setPhaseState('upBuf', isUpBufActive, 'ring-yellow-500');
            
            if (phasesRefs.current.upBar) {
                const targetH = Math.min(100, (inputBufferCount / 30) * 100);
                visualStateRef.current.bufInHeight += (targetH - visualStateRef.current.bufInHeight) * 0.2;
                phasesRefs.current.upBar.style.height = `${visualStateRef.current.bufInHeight}%`;
            }

            const isAiInActive = data.busyRemaining > 0 || data.inFlightCount > 0;
            setPhaseState('aiIn', isAiInActive, 'ring-fuchsia-500');

            if (data.serverRx) visualStateRef.current.rxCounter = 15; 
            const isAiOutActive = visualStateRef.current.rxCounter > 0;
            if (visualStateRef.current.rxCounter > 0) visualStateRef.current.rxCounter--;
            
            setPhaseState('aiOut', isAiOutActive, 'ring-pink-500');

            const outQueue = data.queueLength || 0; 
            const isDownBufActive = outQueue > 0;
            setPhaseState('downBuf', isDownBufActive, 'ring-blue-500');
            
            if (phasesRefs.current.downBar) {
                const targetH = Math.min(100, (outQueue / 5) * 100); 
                visualStateRef.current.bufOutHeight += (targetH - visualStateRef.current.bufOutHeight) * 0.1; 
                phasesRefs.current.downBar.style.height = `${visualStateRef.current.bufOutHeight}%`;
            }

            const isSpeakerActive = data.activeMode === 'translate' && (data.outQueue > 0 || visualStateRef.current.bufOutHeight > 5); 
            setPhaseState('spk', isSpeakerActive, 'ring-indigo-500');

            if (ctx && graphCanvasRef.current) {
                const w = graphCanvasRef.current.width;
                const h = graphCanvasRef.current.height;
                vadHistory.push(data.vadProb);
                vadHistory.shift();
                ctx.clearRect(0, 0, w, h);
                const thY = h - (data.vadThreshold * h);
                ctx.strokeStyle = '#d946ef'; 
                ctx.beginPath(); ctx.moveTo(0, thY); ctx.lineTo(w, thY); ctx.stroke();
                ctx.beginPath(); ctx.strokeStyle = data.isSpeaking ? '#22c55e' : '#64748b'; ctx.lineWidth = 2;
                for(let i=0; i<historySize; i++) { const x = (i/historySize) * w; const y = h - (vadHistory[i] * h); if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); }
                ctx.stroke();
            } else if (!ctx) { initCanvas(); }
        };
        
        animationFrameId = requestAnimationFrame(render);
        return () => cancelAnimationFrame(animationFrameId);
    }, [diagnosticsRef, visualsEnabled]); 

    const handleDocsLinkClick = (key: string) => {
        setSelectedInfo(key);
    };

    const handleAdjustConfig = (key: string, val: number) => {
        if (key === 'vadThreshold') setVadThreshold(val);
        if (key === 'minTurnDuration') setMinTurnDuration(val);
        if (key === 'aiSpeakingRate') setAiSpeakingRate(val);
        if (key === 'silenceThreshold') setSilenceThreshold(val);
        if (key === 'volMultiplier') setVolMultiplier(val);
        if (key === 'elasticityStart') setElasticityStart(val);
        if (key === 'minSpeechDuration') setMinSpeechDuration(val);
        if (key === 'autoSleepTimeout') setAutoSleepTimeout(val);
        if (key === 'momentumStart') setMomentumStart(val);
        if (key === 'ghostTolerance') setGhostTolerance(val);
        if (key === 'coldStartSamples') setColdStartSamples(val);
    };

    const handleToggleConnection = (action: 'connect' | 'disconnect') => {
        if (action === 'connect') connect();
        else disconnect();
    };

    const SectionHeader = ({ title, id, isOpen }: { title: string, id: string, isOpen: boolean }) => (
        <div 
            onClick={() => toggleSection(id)}
            className="flex items-center justify-between cursor-pointer mb-2 group select-none hover:bg-slate-900/30 p-1 rounded transition-colors"
        >
            <div className="text-[10px] font-bold text-slate-500 uppercase group-hover:text-slate-300 transition-colors">
                {title}
            </div>
            <div className="text-slate-600 text-[10px] font-mono group-hover:text-slate-400">
                {isOpen ? '[-]' : '[+]'}
            </div>
        </div>
    );

    return (
        <TowerProvider diagnosticsRef={diagnosticsRef}>
            <div className="fixed inset-0 z-[60] bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-200 overflow-hidden flex flex-col font-sans text-slate-300">
                <button 
                    onClick={() => setDebugMode(false)}
                    className="absolute top-4 right-4 z-[70] bg-slate-800/60 hover:bg-red-500 hover:text-white backdrop-blur rounded-full p-2 text-slate-400 transition-all shadow-xl border border-white/10"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="flex flex-col md:flex-row h-full w-full">
                    <div className="flex-1 overflow-y-auto bg-slate-900/30 border-r border-slate-800 p-4 md:p-8 scrollbar-hide">
                        <div className="max-w-xl mx-auto space-y-8 pb-20">
                            <LogicGraph ref={graphCanvasRef} />
                            <TowerPhases ref={phasesRefs} onSelect={handleDocsLinkClick} />

                            <div className="flex items-center gap-3 pb-2 border-b border-slate-800">
                                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                                <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Systemparametrar & Diagnos</h2>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <SectionHeader title="Globala Verktyg (Kontrollpanel)" id="tools" isOpen={!collapsedSections['tools']} />
                                    {!collapsedSections['tools'] && (
                                        <TowerSettings 
                                            inputDeviceId={inputDeviceId} setInputDeviceId={setInputDeviceId}
                                            outputDeviceId={outputDeviceId} setOutputDeviceId={setOutputDeviceId}
                                            enableProMode={enableProMode} setEnableProMode={setEnableProMode}
                                            debugMode={debugMode} setDebugMode={setDebugMode}
                                            onOpenCalibration={onOpenCalibration}
                                            onHelp={() => {}} onExplain={handleDocsLinkClick}
                                            onClose={() => {}} highlightKey={selectedInfo}
                                            enableLogs={enableLogs} setEnableLogs={setEnableLogs}
                                            onOpenPromptModal={onOpenPromptModal}
                                            visualsEnabled={visualsEnabled}
                                            setVisualsEnabled={setVisualsEnabled}
                                            // PASSING STATS BUT NOT RENDERING DASHBOARD HERE ANYMORE
                                            queueStats={queueStats}
                                            currentPlaybackRate={currentPlaybackRate}
                                            // PASSING CONFIGS TO TOWER SETTINGS
                                            aiSpeakingRate={aiSpeakingRate} setAiSpeakingRate={setAiSpeakingRate}
                                            minTurnDuration={minTurnDuration} setMinTurnDuration={setMinTurnDuration}
                                            vadThreshold={vadThreshold} setVadThreshold={setVadThreshold}
                                        />
                                    )}
                                </div>

                                <div>
                                    <SectionHeader title="Nätverk" id="network" isOpen={!collapsedSections['network']} />
                                    {!collapsedSections['network'] && (
                                        <NetworkLayer 
                                            ref={networkRefs} 
                                            isConnected={isConnected} 
                                            onExplain={handleDocsLinkClick} 
                                            onHelp={() => {}} 
                                            onClose={() => {}}
                                            highlightMap={highlightMap}
                                        />
                                    )}
                                </div>
                                <div>
                                    <SectionHeader title="Beslutsmotor (Logik)" id="logic" isOpen={!collapsedSections['logic']} />
                                    {!collapsedSections['logic'] && (
                                        <LogicLayer 
                                            ref={logicRefs} 
                                            onExplain={handleDocsLinkClick} 
                                            onHelp={() => {}} 
                                            onClose={() => {}} 
                                            vadThreshold={vadThreshold} setVadThreshold={setVadThreshold}
                                            silenceThreshold={silenceThreshold} setSilenceThreshold={setSilenceThreshold}
                                            elasticityStart={elasticityStart} setElasticityStart={setElasticityStart}
                                            minTurnDuration={minTurnDuration} setMinTurnDuration={setMinTurnDuration}
                                            minSpeechDuration={minSpeechDuration} setMinSpeechDuration={setMinSpeechDuration}
                                            autoSleepTimeout={autoSleepTimeout} setAutoSleepTimeout={setAutoSleepTimeout}
                                            coldStartSamples={coldStartSamples} setColdStartSamples={setColdStartSamples}
                                            momentumStart={momentumStart} setMomentumStart={setMomentumStart}
                                            ghostTolerance={ghostTolerance} setGhostTolerance={setGhostTolerance}
                                            aiSpeakingRate={aiSpeakingRate} setAiSpeakingRate={setAiSpeakingRate}
                                            highlightMap={highlightMap}
                                            // NEW: Pass stats to LogicLayer for Tri-Velocity visualization
                                            queueStats={queueStats}
                                            currentPlaybackRate={currentPlaybackRate}
                                        />
                                    )}
                                </div>
                                <div>
                                    <SectionHeader title="Ljudmotor" id="audio" isOpen={!collapsedSections['audio']} />
                                    {!collapsedSections['audio'] && (
                                        <AudioLayer 
                                            ref={audioRefs} 
                                            onExplain={handleDocsLinkClick} 
                                            onHelp={() => {}} 
                                            onClose={() => {}}
                                            volMultiplier={volMultiplier}
                                            setVolMultiplier={setVolMultiplier}
                                            highlightMap={highlightMap}
                                            getBufferStatus={getBufferStatus}
                                            isJitterEnabled={isJitterEnabled}
                                            setIsJitterEnabled={setIsJitterEnabled}
                                            jitterIntensity={jitterIntensity}
                                            setJitterIntensity={setJitterIntensity}
                                        />
                                    )}
                                </div>
                            </div>

                            <div>
                                <SectionHeader title="Diagnos LAB" id="lab" isOpen={!collapsedSections['lab']} />
                                {!collapsedSections['lab'] && (
                                    <TowerDoctor 
                                        diagnosticsRef={diagnosticsRef} onClose={() => {}}
                                        triggerTestTone={triggerTestTone} injectTextAsAudio={injectTextAsAudio}
                                        onAdjustConfig={handleAdjustConfig} onToggleConnection={handleToggleConnection}
                                        onUpdateInstruction={setCustomSystemInstruction} initAudioInput={initAudioInput} 
                                        simulateNetworkDrop={simulateNetworkDrop}
                                    />
                                )}
                            </div>

                            <div className="pt-8 mt-8 border-t border-slate-800">
                                <SectionHeader title="Systemunderhåll" id="maintenance" isOpen={!collapsedSections['maintenance']} />
                                {!collapsedSections['maintenance'] && (
                                    <TowerMaintenance onClose={() => {}} />
                                )}
                            </div>

                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-8 scrollbar-hide flex flex-col">
                        <div className="max-w-xl mx-auto w-full space-y-8 pb-10 flex-1">
                            {selectedInfo && (
                                <div className="animate-in fade-in slide-in-from-top-4 mb-4">
                                    <TowerInfo selectedKey={selectedInfo} onClose={() => setSelectedInfo(null)} onSelectRelation={handleDocsLinkClick} />
                                </div>
                            )}

                            <div className="flex items-center gap-3 pb-2 border-b border-slate-800">
                                <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Kunskapsbank</h2>
                            </div>

                            <div className="text-base text-slate-300 leading-relaxed">
                                <TowerOverview onClose={() => {}} highlightedId={selectedInfo} />
                            </div>
                        </div>

                        <div className="mt-auto py-6 text-center border-t border-slate-800">
                            <p className="text-[10px] text-slate-600 font-mono">
                                Mötesbryggan v6.4 - Systemarkitektur & Konfiguration
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </TowerProvider>
    );
};

export default Tower;
