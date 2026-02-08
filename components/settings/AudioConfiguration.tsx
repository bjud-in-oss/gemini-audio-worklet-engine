
import React, { useEffect, useState } from 'react';

interface AudioConfigurationProps {
    minTurnDuration: number;
    setMinTurnDuration: (val: number) => void;
    vadThreshold: number;
    setVadThreshold: (val: number) => void;
    inputDeviceId?: string; 
    setInputDeviceId?: (val: string) => void; 
    outputDeviceId?: string; 
    setOutputDeviceId?: (val: string) => void; 
    aiSpeakingRate: number; // NEW
    setAiSpeakingRate: (val: number) => void; // NEW
}

const AudioConfiguration: React.FC<AudioConfigurationProps> = ({
    minTurnDuration = 600,
    setMinTurnDuration,
    vadThreshold = 0.5,
    setVadThreshold,
    inputDeviceId,
    setInputDeviceId,
    outputDeviceId,
    setOutputDeviceId,
    aiSpeakingRate,
    setAiSpeakingRate
}) => {
    const [inputDevices, setInputDevices] = useState<MediaDeviceInfo[]>([]);
    const [outputDevices, setOutputDevices] = useState<MediaDeviceInfo[]>([]);

    useEffect(() => {
        let mounted = true;
        const loadDevices = async () => {
             try {
                 const devices = await navigator.mediaDevices.enumerateDevices();
                 if (!mounted) return;
                 
                 const inputs = devices.filter(d => d.kind === 'audioinput');
                 const outputs = devices.filter(d => d.kind === 'audiooutput');
                 
                 setInputDevices(inputs);
                 setOutputDevices(outputs);
             } catch (e) {
                 console.error("Failed to enumerate devices", e);
             }
        };
        
        loadDevices();
        navigator.mediaDevices.addEventListener('devicechange', loadDevices);
        return () => {
            mounted = false;
            navigator.mediaDevices.removeEventListener('devicechange', loadDevices);
        };
    }, []);

    // Safe values
    const safeLatency = typeof minTurnDuration === 'number' ? minTurnDuration : 600;
    const safeThreshold = typeof vadThreshold === 'number' ? vadThreshold : 0.5;
    const safeRate = typeof aiSpeakingRate === 'number' ? aiSpeakingRate : 1.0;

    return (
    <div className="space-y-6">
        <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
            Konfiguration
        </h4>

        {/* DEVICE SELECTORS */}
        {setInputDeviceId && setOutputDeviceId && (
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 space-y-4">
                <div className="space-y-1">
                    <label className="text-sm font-bold text-white block">Mikrofon</label>
                    <select 
                        value={inputDeviceId}
                        onChange={(e) => setInputDeviceId(e.target.value)}
                        className="w-full bg-slate-700 text-white text-xs rounded p-2 border border-slate-600 focus:border-indigo-500 focus:outline-none"
                    >
                        <option value="default">Systemstandard</option>
                        {inputDevices.map(device => (
                            <option key={device.deviceId} value={device.deviceId}>
                                {device.label || `Mikrofon ${device.deviceId.slice(0,5)}...`}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-bold text-white block">Högtalare</label>
                    <select 
                        value={outputDeviceId}
                        onChange={(e) => setOutputDeviceId(e.target.value)}
                        className="w-full bg-slate-700 text-white text-xs rounded p-2 border border-slate-600 focus:border-indigo-500 focus:outline-none"
                    >
                        <option value="default">Systemstandard</option>
                        {outputDevices.map(device => (
                            <option key={device.deviceId} value={device.deviceId}>
                                {device.label || `Högtalare ${device.deviceId.slice(0,5)}...`}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        )}
        
        {/* SPEAKING RATE (NEW) */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex justify-between mb-3">
                <label className="text-sm font-bold text-white">AI Talhastighet (Regi)</label>
                <span className="text-xs font-mono text-green-300 bg-green-900/20 px-2 py-0.5 rounded">
                    {safeRate.toFixed(1)}x
                </span>
            </div>
            <input 
            type="range" 
            min="0.5" 
            max="2.0" 
            step="0.1" 
            value={safeRate}
            onChange={(e) => setAiSpeakingRate(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500 hover:accent-green-400"
            />
            <div className="flex justify-between text-[9px] text-slate-500 mt-1 px-1">
                <span>Långsam</span>
                <span>Normal</span>
                <span>Turbo</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-3 leading-relaxed border-t border-slate-700/50 pt-2">
                <strong>Stil:</strong> Detta styr inte bara hastigheten utan även <em>attityden</em>. Över 1.3x börjar AI:n prata som en stressad nyhetsuppläsare för att hinna med.
            </p>
        </div>

        {/* MIN TURN DURATION */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex justify-between mb-3">
                <label className="text-sm font-bold text-white">Input Latens (Buffert)</label>
                <span className="text-xs font-mono text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded">
                    {(safeLatency / 1000).toFixed(1)} s
                </span>
            </div>
            <input 
            type="range" 
            min="500" 
            max="8000" 
            step="100" 
            value={safeLatency}
            onChange={(e) => setMinTurnDuration(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400"
            />
            <p className="text-[10px] text-slate-400 mt-3 leading-relaxed border-t border-slate-700/50 pt-2">
                <strong>Balans:</strong> Lågt värde (snabbare) vs Högt värde (stabilare). 
                Bestämmer hur mycket ljud som måste spelas in innan det skickas till AI:n.
            </p>
        </div>

        {/* VAD THRESHOLD */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex justify-between mb-3">
                <label className="text-sm font-bold text-white">Brusfilter (Känslighet)</label>
                <span className="text-xs font-mono text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded">
                    {(safeThreshold * 100).toFixed(0)}%
                </span>
            </div>
            <input 
            type="range" 
            min="0.1" 
            max="0.9" 
            step="0.05" 
            value={safeThreshold}
            onChange={(e) => setVadThreshold(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400"
            />
            <p className="text-[10px] text-slate-400 mt-3 leading-relaxed border-t border-slate-700/50 pt-2">
            <strong>Brusreducering:</strong> Höj detta värde om fläktar eller bakgrundssorl aktiverar mikrofonen av misstag. 
            Sänkt värde gör den känsligare för viskningar.
            </p>
        </div>
    </div>
  );
};

export default AudioConfiguration;
