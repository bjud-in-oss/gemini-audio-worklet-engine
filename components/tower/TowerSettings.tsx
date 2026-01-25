
import React, { useEffect, useState } from 'react';

interface TowerSettingsProps {
    inputDeviceId?: string;
    setInputDeviceId?: (val: string) => void;
    outputDeviceId?: string;
    setOutputDeviceId?: (val: string) => void;

    debugMode: boolean;
    setDebugMode: (val: boolean) => void;
    onOpenCalibration: () => void;
    onHelp: (key: string) => void; 
    onExplain: (key: string) => void; 
    onClose: () => void; 
    highlightKey: string | null; 
    enableLogs: boolean;
    setEnableLogs: (val: boolean) => void;
    onOpenPromptModal: () => void; 
    
    // Toggle for Audio Pipeline Visuals
    visualsEnabled?: boolean;
    setVisualsEnabled?: (val: boolean) => void;
}

const TowerSettings: React.FC<TowerSettingsProps> = ({
    inputDeviceId,
    setInputDeviceId,
    outputDeviceId,
    setOutputDeviceId,
    debugMode,
    setDebugMode,
    onOpenCalibration,
    onHelp,
    onExplain,
    onClose,
    highlightKey,
    enableLogs,
    setEnableLogs,
    onOpenPromptModal,
    visualsEnabled = true, // Default to true if undefined
    setVisualsEnabled
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

    return (
        <div className="space-y-4">
            
            {/* TOOLS */}
            <div className="flex gap-2 pb-2 border-b border-slate-700/50 flex-wrap">
                <button onClick={() => setEnableLogs(!enableLogs)} className={`flex-1 min-w-[80px] text-[9px] font-bold py-2 rounded transition-colors border ${enableLogs ? 'bg-slate-800 text-slate-400 border-slate-600 hover:bg-slate-700' : 'bg-red-900/30 text-red-300 border-red-500/50 hover:bg-red-900/50 animate-pulse'}`}>
                    {enableLogs ? "LOGGAR: PÅ" : "LOGGAR: AV"}
                </button>
                
                {/* AUDIO PIPELINE TOGGLE - ALWAYS RENDERED */}
                <button 
                    onClick={toggleVisuals} 
                    className={`flex-1 min-w-[80px] text-[9px] font-bold py-2 rounded transition-colors border ${visualsEnabled ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30 hover:bg-indigo-600/30' : 'bg-slate-800 text-slate-500 border-slate-700 hover:bg-slate-700'}`}
                    disabled={!setVisualsEnabled}
                    title={!setVisualsEnabled ? "Funktion ej tillgänglig" : "Slå av/på tung grafik"}
                >
                    {visualsEnabled ? "VISUALS: ON" : "VISUALS: OFF"}
                </button>

                <button onClick={onOpenCalibration} className="flex-1 min-w-[80px] text-[9px] font-bold py-2 rounded bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition-colors">
                    STARTA KALIBRERING
                </button>
                <button onClick={onOpenPromptModal} className="w-full text-[9px] font-bold py-2 rounded bg-slate-800 text-slate-300 border border-slate-600 hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    REDIGERA SYSTEM PROMPT
                </button>
            </div>

            {/* DEVICES */}
            {setInputDeviceId && setOutputDeviceId && (
                <div className="space-y-2 pb-2 border-b border-slate-700/50">
                    <div>
                        <label className="text-[9px] font-bold text-slate-400 block mb-1">MIKROFON</label>
                        <select value={inputDeviceId} onChange={(e) => setInputDeviceId(e.target.value)} className="w-full bg-slate-800 text-white text-[9px] rounded px-2 py-1 border border-slate-600">
                            <option value="default">Default</option>
                            {inputDevices.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || d.deviceId.slice(0,5)}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-[9px] font-bold text-slate-400 block mb-1">HÖGTALARE</label>
                        <select value={outputDeviceId} onChange={(e) => setOutputDeviceId(e.target.value)} className="w-full bg-slate-800 text-white text-[9px] rounded px-2 py-1 border border-slate-600">
                            <option value="default">Default</option>
                            {outputDevices.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || d.deviceId.slice(0,5)}</option>)}
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TowerSettings;
