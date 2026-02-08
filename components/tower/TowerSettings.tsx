
import React, { useEffect, useState } from 'react';
import { QueueStats } from '../../types';

interface TowerSettingsProps {
    inputDeviceId?: string; setInputDeviceId?: (val: string) => void;
    outputDeviceId?: string; setOutputDeviceId?: (val: string) => void;
    
    enableProMode?: boolean; setEnableProMode?: (val: boolean) => void;
    debugMode: boolean; setDebugMode: (val: boolean) => void;
    onOpenCalibration: () => void;
    onHelp: (key: string) => void; 
    onExplain: (key: string) => void; 
    onClose: () => void; 
    highlightKey: string | null; 
    enableLogs: boolean; setEnableLogs: (val: boolean) => void;
    onOpenPromptModal: () => void; 
    
    visualsEnabled?: boolean; setVisualsEnabled?: (val: boolean) => void;

    // REALTIME METRICS - Keep them in props just in case, but unused for UI now
    queueStats?: QueueStats;
    currentPlaybackRate?: number;

    // CONFIGURATION CONTROLS
    aiSpeakingRate?: number; setAiSpeakingRate?: (val: number) => void;
    minTurnDuration?: number; setMinTurnDuration?: (val: number) => void;
    vadThreshold?: number; setVadThreshold?: (val: number) => void;
}

const TowerSettings: React.FC<TowerSettingsProps> = ({
    inputDeviceId, setInputDeviceId,
    outputDeviceId, setOutputDeviceId,
    enableProMode, setEnableProMode,
    debugMode, setDebugMode,
    onOpenCalibration,
    onHelp, onExplain, onClose,
    highlightKey,
    enableLogs, setEnableLogs,
    onOpenPromptModal,
    visualsEnabled = true, setVisualsEnabled,
    queueStats,
    currentPlaybackRate = 1.0,
    aiSpeakingRate = 1.0, setAiSpeakingRate,
    minTurnDuration = 600, setMinTurnDuration,
    vadThreshold = 0.5, setVadThreshold
}) => {
    
    const [inputDevices, setInputDevices] = useState<MediaDeviceInfo[]>([]);
    const [outputDevices, setOutputDevices] = useState<MediaDeviceInfo[]>([]);

    useEffect(() => {
        let mounted = true;
        const loadDevices = async () => {
             try {
                 const devices = await navigator.mediaDevices.enumerateDevices();
                 if (!mounted) return;
                 setInputDevices(devices.filter(d => d.kind === 'audioinput'));
                 setOutputDevices(devices.filter(d => d.kind === 'audiooutput'));
             } catch (e) { console.error(e); }
        };
        loadDevices();
        navigator.mediaDevices.addEventListener('devicechange', loadDevices);
        return () => { mounted = false; navigator.mediaDevices.removeEventListener('devicechange', loadDevices); };
    }, []);

    const toggleVisuals = () => {
        if (setVisualsEnabled) {
            setVisualsEnabled(!visualsEnabled);
        }
    };

    const getDeviceTypeIcon = (label: string) => {
        const l = label.toLowerCase();
        if (l.includes('voicemeeter') || l.includes('vb-audio')) return '🎛️'; 
        if (l.includes('ndi')) return '📡'; 
        if (l.includes('usb')) return '🔌'; 
        return '🎤';
    };

    // --- Tri-Velocity Dashboard MOVED to LogicMetrics (Transport & Flow) ---

    return (
        <div className="space-y-4">
            
            {/* 1. CONFIGURATION SLIDERS */}
            <div className="bg-slate-900/30 rounded-xl border border-slate-800 p-3 space-y-3">
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-1">Huvudkonfiguration</div>
                
                {setAiSpeakingRate && (
                    <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400">
                            <span>AI Grundtempo (Persona)</span>
                            <span className="text-green-400 font-mono">{aiSpeakingRate.toFixed(1)}x</span>
                        </div>
                        <input 
                            type="range" min="0.5" max="2.0" step="0.1" 
                            value={aiSpeakingRate}
                            onChange={(e) => setAiSpeakingRate(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-green-500"
                        />
                    </div>
                )}

                {setMinTurnDuration && (
                    <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400">
                            <span>Input Latens (Buffert)</span>
                            <span className="text-indigo-400 font-mono">{(minTurnDuration/1000).toFixed(1)}s</span>
                        </div>
                        <input 
                            type="range" min="500" max="5000" step="100" 
                            value={minTurnDuration}
                            onChange={(e) => setMinTurnDuration(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                    </div>
                )}

                {setVadThreshold && (
                    <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400">
                            <span>Bruskänslighet (VAD)</span>
                            <span className="text-fuchsia-400 font-mono">{(vadThreshold * 100).toFixed(0)}%</span>
                        </div>
                        <input 
                            type="range" min="0.1" max="0.9" step="0.05" 
                            value={vadThreshold}
                            onChange={(e) => setVadThreshold(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
                        />
                    </div>
                )}
            </div>

            {/* 2. DEVICE SELECTORS */}
            {setInputDeviceId && setOutputDeviceId && (
                <div className="space-y-3 pb-2 border-b border-slate-700/50">
                    <div className="bg-slate-900/50 p-2 rounded border border-slate-800">
                        <label className="text-[9px] font-bold text-indigo-400 block mb-1 uppercase tracking-wider">Ljudkälla (Input)</label>
                        <div className="relative">
                            <select value={inputDeviceId} onChange={(e) => setInputDeviceId(e.target.value)} className="w-full bg-slate-800 text-white text-[10px] rounded px-2 py-1.5 border border-slate-600 focus:border-indigo-500 outline-none appearance-none">
                                <option value="default">System Default</option>
                                {inputDevices.map(d => (
                                    <option key={d.deviceId} value={d.deviceId}>
                                        {getDeviceTypeIcon(d.label)} {d.label || d.deviceId.slice(0,8)}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                                <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                        </div>
                        {inputDevices.find(d => d.deviceId === inputDeviceId && (d.label.toLowerCase().includes('voicemeeter') || d.label.toLowerCase().includes('ndi'))) && (
                            <div className="mt-1 text-[8px] text-amber-400 flex items-center gap-1">
                                <span className="w-1 h-1 bg-amber-400 rounded-full animate-pulse"></span>
                                ASIO Bridge / Virtual Router Detected
                            </div>
                        )}
                        
                        {setEnableProMode && (
                            <div className="mt-3 pt-2 border-t border-slate-700/50">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={enableProMode} 
                                        onChange={(e) => setEnableProMode(e.target.checked)}
                                        className="w-3 h-3 rounded bg-slate-800 border-slate-600 text-indigo-500 focus:ring-0"
                                    />
                                    <span className={`text-[9px] font-bold ${enableProMode ? 'text-green-400' : 'text-slate-500'}`}>
                                        PRO MODE (Raw Audio / DSP Hardware)
                                    </span>
                                </label>
                                {enableProMode && (
                                    <p className="text-[8px] text-slate-400 mt-1 pl-5">
                                        Avaktiverar mjukvarufilter (Echo Cancel, Noise Sup). 
                                        Använd <strong>endast</strong> om du har extern DSP (Tesira/Xilica).
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-900/50 p-2 rounded border border-slate-800">
                        <label className="text-[9px] font-bold text-indigo-400 block mb-1 uppercase tracking-wider">Uppspelning (Output)</label>
                        <div className="relative">
                            <select value={outputDeviceId} onChange={(e) => setOutputDeviceId(e.target.value)} className="w-full bg-slate-800 text-white text-[10px] rounded px-2 py-1.5 border border-slate-600 focus:border-indigo-500 outline-none appearance-none">
                                <option value="default">System Default</option>
                                {outputDevices.map(d => (
                                    <option key={d.deviceId} value={d.deviceId}>
                                        {getDeviceTypeIcon(d.label)} {d.label || d.deviceId.slice(0,8)}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                                <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. TOOLS BUTTONS */}
            <div className="flex gap-2 pb-2 border-b border-slate-700/50 flex-wrap">
                <button onClick={() => setEnableLogs(!enableLogs)} className={`flex-1 min-w-[80px] text-[9px] font-bold py-2 rounded transition-colors border ${enableLogs ? 'bg-slate-800 text-slate-400 border-slate-600 hover:bg-slate-700' : 'bg-red-900/30 text-red-300 border-red-500/50 hover:bg-red-900/50 animate-pulse'}`}>
                    {enableLogs ? "LOGGAR: PÅ" : "LOGGAR: AV"}
                </button>
                
                <button 
                    onClick={toggleVisuals} 
                    className={`flex-1 min-w-[80px] text-[9px] font-bold py-2 rounded transition-colors border ${visualsEnabled ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30 hover:bg-indigo-600/30' : 'bg-slate-800 text-slate-500 border-slate-700 hover:bg-slate-700'}`}
                    disabled={!setVisualsEnabled}
                    title={!setVisualsEnabled ? "Funktion ej tillgänglig" : "Slå av/på tung grafik"}
                >
                    {visualsEnabled ? "VISUALS: ON" : "VISUALS: OFF"}
                </button>

                <button onClick={onOpenCalibration} className="flex-1 min-w-[80px] text-[9px] font-bold py-2 rounded bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition-colors">
                    KALIBRERING
                </button>
                <button onClick={onOpenPromptModal} className="w-full text-[9px] font-bold py-2 rounded bg-slate-800 text-slate-300 border border-slate-600 hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    REDIGERA SYSTEM PROMPT
                </button>
            </div>
        </div>
    );
};

export default TowerSettings;
