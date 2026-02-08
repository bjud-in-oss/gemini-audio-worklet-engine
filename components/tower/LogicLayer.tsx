
import React, { forwardRef } from 'react';
import { LayerProps } from './types';
// LogicGraph moved to Tower.tsx
import LogicMetrics, { LogicMetricsRefs } from './logic/LogicMetrics';
import { QueueStats } from '../../types';

interface LogicLayerProps extends LayerProps {
    vadThreshold: number; setVadThreshold: (val: number) => void;
    silenceThreshold: number; setSilenceThreshold: (val: number) => void;
    elasticityStart: number; setElasticityStart: (val: number) => void;
    minTurnDuration: number; setMinTurnDuration: (val: number) => void;
    minSpeechDuration: number; setMinSpeechDuration: (val: number) => void;
    autoSleepTimeout: number; setAutoSleepTimeout: (val: number) => void;
    coldStartSamples: number; setColdStartSamples: (val: number) => void;
    
    // NEW GHOST PROPS
    momentumStart: number; setMomentumStart: (val: number) => void;
    ghostTolerance: number; setGhostTolerance: (val: number) => void;

    // NEW: AI Speaking Rate
    aiSpeakingRate: number; setAiSpeakingRate: (val: number) => void;
    
    // NEW: Stats for Tri-Velocity
    queueStats?: QueueStats;
    currentPlaybackRate?: number;
}

export interface LogicLayerRefs extends LogicMetricsRefs {
    // canvasRef moved to Tower
}

const LogicLayer = forwardRef<LogicLayerRefs, LogicLayerProps>(({ 
    onExplain, onHelp, onClose,
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
    return (
        <div className="bg-slate-900/40 border-b border-emerald-500/20 pb-2 space-y-2">
            {/* LogicGraph was here, moved to parent */}

            <LogicMetrics 
                onExplain={onExplain} 
                ref={ref as React.Ref<LogicMetricsRefs>}
                
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
                
                queueStats={queueStats}
                currentPlaybackRate={currentPlaybackRate}
            />
        </div>
    );
});

export default LogicLayer;
