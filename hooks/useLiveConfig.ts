
import { useState, useEffect } from 'react';
import { VAD_CONFIG } from '../utils/vadLogic';

export function useLiveConfig() {
    // UPDATED: Start empty, load from localStorage
    const [targetLanguages, setTargetLanguages] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem('app_target_languages');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    // Save languages whenever they change
    useEffect(() => {
        localStorage.setItem('app_target_languages', JSON.stringify(targetLanguages));
    }, [targetLanguages]);

    const [currentRoom, setCurrentRoom] = useState("Stora salen");
    
    // Configurable Parameters
    const [minTurnDuration, setMinTurnDuration] = useState<number>(VAD_CONFIG.MIN_TURN_DURATION_DEFAULT);
    const [vadThreshold, setVadThreshold] = useState<number>(0.6);
    const [silenceThreshold, setSilenceThreshold] = useState<number>(VAD_CONFIG.SILENCE_THRESHOLD_MS); 
    
    // NEW: Elasticity & Min Speech & Cold Start & Ghost Pressure
    const [elasticityStart, setElasticityStart] = useState<number>(5.0); // Seconds
    const [minSpeechDuration, setMinSpeechDuration] = useState<number>(150); // ms
    const [coldStartSamples, setColdStartSamples] = useState<number>(5); // Turns
    
    // THE GHOST PARAMETERS
    const [momentumStart, setMomentumStart] = useState<number>(VAD_CONFIG.MOMENTUM_START_SEC);
    const [ghostTolerance, setGhostTolerance] = useState<number>(VAD_CONFIG.GHOST_TOLERANCE_MS);

    const [volMultiplier, setVolMultiplier] = useState<number>(1.0); 
    const [aiSpeakingRate, setAiSpeakingRate] = useState<number>(1.0);
    
    // NEW: Configurable Auto Sleep
    const [autoSleepTimeout, setAutoSleepTimeout] = useState<number>(120); // Seconds (Default 2 min)
    
    // DEVICE SELECTION
    const [inputDeviceId, setInputDeviceId] = useState<string>('default');
    const [outputDeviceId, setOutputDeviceId] = useState<string>('default');
    
    // NEW: PRO MODE (Disable Software Processing for DSP Hardware like Tesira)
    const [enableProMode, setEnableProMode] = useState<boolean>(false);

    // NEW: TRANSCRIPTION TOGGLE (Logic vs Visual)
    // If false, model will not send text, only audio.
    const [isTranscriptionEnabled, setIsTranscriptionEnabled] = useState<boolean>(true);

    const [debugMode, setDebugMode] = useState<boolean>(false);
    
    // UPDATED TYPE: Now includes 'pause'
    const [activeMode, setActiveMode] = useState<'translate' | 'pause' | 'off'>('off');
    
    // PERSISTENT: Console Log Control (Default FALSE)
    const [enableLogs, setEnableLogs] = useState<boolean>(() => {
        const saved = localStorage.getItem('app_enable_logs');
        return saved === 'true'; // Defaults to false if null/undefined
    });

    // PERSISTENT: Custom System Instruction
    const [customSystemInstruction, setCustomSystemInstruction] = useState<string | null>(() => {
        return localStorage.getItem('app_custom_prompt') || null;
    });

    // Save Logs setting
    useEffect(() => {
        localStorage.setItem('app_enable_logs', String(enableLogs));
        (window as any).APP_LOGS_ENABLED = enableLogs;
        if (enableLogs) {
            console.log("[System] 🟢 Console Logs Enabled");
        } 
    }, [enableLogs]);

    // Save Prompt setting
    useEffect(() => {
        if (customSystemInstruction) {
            localStorage.setItem('app_custom_prompt', customSystemInstruction);
        } else {
            localStorage.removeItem('app_custom_prompt');
        }
    }, [customSystemInstruction]);

    return {
        targetLanguages, setTargetLanguages,
        currentRoom, setCurrentRoom,
        
        // Audio/VAD Config
        minTurnDuration, setMinTurnDuration,
        vadThreshold, setVadThreshold,
        silenceThreshold, setSilenceThreshold,
        elasticityStart, setElasticityStart, 
        minSpeechDuration, setMinSpeechDuration, 
        coldStartSamples, setColdStartSamples,
        momentumStart, setMomentumStart, 
        ghostTolerance, setGhostTolerance, 
        volMultiplier, setVolMultiplier,
        aiSpeakingRate, setAiSpeakingRate,
        autoSleepTimeout, setAutoSleepTimeout, 
        
        // Devices
        inputDeviceId, setInputDeviceId,
        outputDeviceId, setOutputDeviceId,
        enableProMode, setEnableProMode,
        isTranscriptionEnabled, setIsTranscriptionEnabled,

        debugMode, setDebugMode,
        activeMode, setActiveMode,
        
        enableLogs, setEnableLogs,
        customSystemInstruction, setCustomSystemInstruction
    };
}
