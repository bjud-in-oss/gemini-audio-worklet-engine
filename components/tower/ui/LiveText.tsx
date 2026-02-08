
import React, { useEffect, useState, useRef } from 'react';
import { useTowerDiagnostics } from '../TowerContext';
import { DiagnosticData } from '../types';

// MAPPING: ID -> DiagnosticData Property
const ID_MAP: Record<string, keyof DiagnosticData | string> = {
    // Audio
    'RMS': 'rms',
    'SR': 'sampleRate',
    'CTX': 'audioContextState',
    'FRM': 'framesProcessed',
    
    // Logic / VAD
    'VAD': 'vadProb',
    'THR': 'vadThreshold',
    'SPK': 'isSpeaking',
    'SIL': 'silenceDuration',
    'SQZ': 'currentSilenceThreshold',
    'PUP': 'puppeteerState', // NEW
    
    // Config (Active values)
    'C_THR': 'vadThreshold',
    'C_SIL': 'silenceThreshold',
    'C_VOL': 'volMultiplier',
    
    // System
    'GAP': 'bufferGap',
    'BUF': 'bufferSize',
    'MODE': 'activeMode',
    'LTC': 'currentLatency',
    'RTT': 'rtt',
    
    // The Shield
    'SHLD': 'shieldActive',
    'DAM': 'shieldSize',
    
    // Queue
    'BSY': 'busyRemaining',
    'Q_LN': 'queueLength',
    'ASLP': 'autoSleepCountdown',
    'V_ST': 'activeMode', // Proxy for state
    
    // Debug
    'CN_B': 'connectingBufferSize',
    'INF': 'inFlightCount',
    'L_TS': 'timeSinceLastSpeech',
    'V_AVG': 'avgVadProb',
    
    // Network
    'WS': 'wsState',
    'TX': 'networkEvent', // visual proxy
    'RX': 'serverRx'
};

const LiveValue = ({ id, propKey }: { id: string, propKey: string }) => {
    const diagRef = useTowerDiagnostics();
    const spanRef = useRef<HTMLSpanElement>(null);
    
    useEffect(() => {
        let rAf: number;
        const update = () => {
            if (spanRef.current && diagRef.current) {
                const rawVal = (diagRef.current as any)[propKey];
                let displayVal = '---';
                let colorClass = 'text-slate-500';

                // FORMATTING LOGIC
                if (typeof rawVal === 'number') {
                    if (propKey === 'rms') displayVal = rawVal.toFixed(4);
                    else if (propKey.toLowerCase().includes('latency') || propKey === 'rtt') displayVal = rawVal.toFixed(0) + 'ms';
                    else if (propKey.toLowerCase().includes('threshold') || propKey === 'SQZ') displayVal = rawVal.toFixed(0) + 'ms';
                    else if (propKey === 'silenceDuration') displayVal = rawVal.toFixed(2) + 's';
                    else if (propKey === 'vadProb') displayVal = (rawVal * 100).toFixed(0) + '%';
                    else displayVal = rawVal.toString();
                    
                    // Simple coloring
                    if (propKey === 'rms' && rawVal > 0.002) colorClass = 'text-green-400 font-bold';
                    if (propKey === 'isSpeaking' && rawVal) colorClass = 'text-green-400 font-bold';
                    if (propKey === 'shieldSize' && rawVal > 0) colorClass = 'text-blue-400 font-bold';
                } else if (typeof rawVal === 'string') {
                    displayVal = rawVal;
                    if (rawVal === 'OPEN' || rawVal === 'running') colorClass = 'text-green-400';
                    if (propKey === 'puppeteerState') {
                        if (rawVal === 'REPEAT') colorClass = 'text-blue-400 animate-pulse font-bold';
                        else if (rawVal === 'FILLER') colorClass = 'text-fuchsia-400 animate-pulse font-bold';
                        else if (rawVal === 'CUT') colorClass = 'text-red-500 animate-pulse font-black';
                        else if (rawVal === 'IDLE') colorClass = 'text-slate-600';
                    }
                } else if (typeof rawVal === 'boolean') {
                    if (propKey === 'shieldActive') {
                        displayVal = rawVal ? 'LÅST' : 'ÖPPEN';
                        colorClass = rawVal ? 'text-red-500 font-black animate-pulse' : 'text-green-500';
                    } else {
                        displayVal = rawVal ? 'ON' : 'OFF';
                        colorClass = rawVal ? 'text-green-400' : 'text-slate-500';
                    }
                }

                spanRef.current.innerText = `[${displayVal}]`;
                spanRef.current.className = `ml-1 font-mono text-[9px] ${colorClass}`;
            }
            rAf = requestAnimationFrame(update);
        };
        update();
        return () => cancelAnimationFrame(rAf);
    }, [propKey]);

    return <span ref={spanRef}></span>;
};

export const LiveText: React.FC<{ text: string }> = ({ text }) => {
    // Regex matches known IDs (Words in CAPS that exist in ID_MAP)
    // We split the text by these IDs to inject components
    const parts = text.split(/(\b[A-Z_]{2,6}\b)/g);

    return (
        <span>
            {parts.map((part, i) => {
                const mapKey = ID_MAP[part];
                if (mapKey) {
                    return (
                        <React.Fragment key={i}>
                            <span className="font-bold text-slate-200">{part}</span>
                            <LiveValue id={part} propKey={mapKey as string} />
                        </React.Fragment>
                    );
                }
                return <span key={i}>{part}</span>;
            })}
        </span>
    );
};
