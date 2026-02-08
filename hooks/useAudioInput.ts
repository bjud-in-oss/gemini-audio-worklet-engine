
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { TurnPackage } from '../types';
import { createPcmBlob } from '../utils/audioUtils';
import { INPUT_WORKLET_CODE, VAD_WORKER_CODE } from '../utils/workerScripts';

interface UseAudioInputProps {
    activeMode: 'translate' | 'pause' | 'off';
    vadThreshold: number;
    minTurnDuration: number;
    silenceThreshold: number;
    elasticityStart: number;
    minSpeechDuration: number;
    volMultiplier: number;
    
    // NEW GHOST PROPS
    momentumStart: number;
    ghostTolerance: number;

    inputDeviceId: string;
    isPlaying: boolean;
    busyUntilRef: React.MutableRefObject<number>;
    onPhraseDetected: (turn: TurnPackage) => void;
    onAudioData: (base64: string) => void;
    debugMode: boolean;
    audioDiagnosticsRef: React.MutableRefObject<any>;
    // NEW: Hydraulic Props
    bufferGap: number; 
    shieldBufferRef: React.MutableRefObject<string[]>;
    
    // NEW: PRO MODE
    enableProMode: boolean;

    // NEW: PUPPETEER PROTOCOL
    sendTextSignal: (text: string) => void;
    targetLanguage: string;
}

export function useAudioInput({
    activeMode,
    vadThreshold,
    minTurnDuration,
    silenceThreshold,
    elasticityStart,
    minSpeechDuration,
    volMultiplier,
    momentumStart,
    ghostTolerance,
    inputDeviceId,
    isPlaying,
    busyUntilRef,
    onPhraseDetected,
    onAudioData,
    debugMode,
    audioDiagnosticsRef,
    bufferGap,
    shieldBufferRef,
    enableProMode,
    sendTextSignal,
    targetLanguage
}: UseAudioInputProps) {
    
    const [effectiveMinDuration, setEffectiveMinDuration] = useState(minTurnDuration);
    const [currentLatency, setCurrentLatency] = useState(0);

    const inputContextRef = useRef<AudioContext | null>(null);
    const workletNodeRef = useRef<AudioWorkletNode | null>(null); // Replaces processorRef
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const workerRef = useRef<Worker | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    
    // Blob URLs for cleanup
    const vadBlobUrlRef = useRef<string | null>(null);
    const inputWorkletBlobUrlRef = useRef<string | null>(null);

    const pcmBufferRef = useRef<Float32Array[]>([]);

    const activeModeRef = useRef(activeMode);
    const vadThresholdRef = useRef(vadThreshold);
    const minTurnDurationRef = useRef(minTurnDuration);
    const silenceThresholdRef = useRef(silenceThreshold);
    const elasticityStartRef = useRef(elasticityStart);
    const minSpeechDurationRef = useRef(minSpeechDuration);
    const volMultiplierRef = useRef(volMultiplier);
    
    const momentumStartRef = useRef(momentumStart);
    const ghostToleranceRef = useRef(ghostTolerance);
    
    const bufferGapRef = useRef(bufferGap);
    
    // PUPPETEER REFS
    const silenceTimerRef = useRef<any>(null);
    const silenceStageRef = useRef<number>(0); 
    const currentTargetLangRef = useRef(targetLanguage);

    const isSpeakingRef = useRef(false);
    const speechStartTimeRef = useRef(0);
    const silenceStartTimeRef = useRef(0);
    
    // Update Refs
    useEffect(() => { activeModeRef.current = activeMode; }, [activeMode]);
    useEffect(() => { vadThresholdRef.current = vadThreshold; }, [vadThreshold]);
    useEffect(() => { minTurnDurationRef.current = minTurnDuration; }, [minTurnDuration]);
    useEffect(() => { silenceThresholdRef.current = silenceThreshold; }, [silenceThreshold]);
    useEffect(() => { elasticityStartRef.current = elasticityStart; }, [elasticityStart]);
    useEffect(() => { minSpeechDurationRef.current = minSpeechDuration; }, [minSpeechDuration]);
    useEffect(() => { volMultiplierRef.current = volMultiplier; }, [volMultiplier]);
    useEffect(() => { momentumStartRef.current = momentumStart; }, [momentumStart]);
    useEffect(() => { ghostToleranceRef.current = ghostTolerance; }, [ghostTolerance]);
    useEffect(() => { bufferGapRef.current = bufferGap; }, [bufferGap]);
    useEffect(() => { currentTargetLangRef.current = targetLanguage; }, [targetLanguage]);

    const flushTurn = useCallback(() => {
        if (pcmBufferRef.current.length === 0) return;

        let totalLength = 0;
        for (const chunk of pcmBufferRef.current) {
            totalLength += chunk.length;
        }

        const fullBuffer = new Float32Array(totalLength);
        let offset = 0;
        for (const chunk of pcmBufferRef.current) {
            fullBuffer.set(chunk, offset);
            offset += chunk.length;
        }

        const durationMs = (totalLength / 16000) * 1000;

        if (durationMs > 50) { 
            const pcmBlob = createPcmBlob(fullBuffer);
            const turnId = Date.now().toString();
            
            const turnPackage: TurnPackage = {
                id: turnId,
                audioData: pcmBlob.data,
                timestamp: Date.now(),
                durationMs: durationMs,
                confidenceScore: 1.0 
            };
            
            onPhraseDetected(turnPackage);
        }

        pcmBufferRef.current = [];
        
        if (audioDiagnosticsRef.current) {
            audioDiagnosticsRef.current.bufferSize = 0;
        }
    }, [onPhraseDetected, audioDiagnosticsRef]);

    const handleWorkerResult = useCallback((chunk: Float32Array, prob: number, rms: number) => {
        const now = Date.now();
        const mode = activeModeRef.current;
        
        const effectiveThreshold = vadThresholdRef.current;
        const sustainThreshold = effectiveThreshold * 0.6;
        const activeThreshold = isSpeakingRef.current ? sustainThreshold : effectiveThreshold;

        if (audioDiagnosticsRef.current) {
            audioDiagnosticsRef.current.rms = rms;
            audioDiagnosticsRef.current.vadProb = prob;
            audioDiagnosticsRef.current.vadThreshold = activeThreshold;
            audioDiagnosticsRef.current.isSpeaking = isSpeakingRef.current;
            audioDiagnosticsRef.current.busyRemaining = Math.max(0, busyUntilRef.current - now);
        }
        
        if (mode === 'off') return;

        const isSpeech = prob > activeThreshold;
        
        if (isSpeech) {
            // --- SPEECH DETECTED ---
            
            // KILL PUPPETEER TIMER
            if (silenceTimerRef.current) {
                clearInterval(silenceTimerRef.current);
                silenceTimerRef.current = null;
            }
            silenceStageRef.current = 0;
            
            // UPDATE DIAGNOSTICS: IDLE
            if(audioDiagnosticsRef.current) audioDiagnosticsRef.current.puppeteerState = 'IDLE';

            if (!isSpeakingRef.current) {
                isSpeakingRef.current = true;
                speechStartTimeRef.current = now;
            }
            silenceStartTimeRef.current = 0;
        } else {
            // --- SILENCE DETECTED ---
            if (isSpeakingRef.current) {
                if (silenceStartTimeRef.current === 0) {
                    silenceStartTimeRef.current = now;
                    
                    // START PUPPETEER TIMER
                    if (silenceTimerRef.current) clearInterval(silenceTimerRef.current);
                    
                    silenceTimerRef.current = setInterval(() => {
                        const elapsed = Date.now() - silenceStartTimeRef.current;

                        // STAGE 1: REPEAT (1.5s)
                        if (elapsed > 1500 && silenceStageRef.current === 0) {
                            sendTextSignal('[CMD: REPEAT_LAST]'); 
                            silenceStageRef.current = 1;
                            if(audioDiagnosticsRef.current) audioDiagnosticsRef.current.puppeteerState = 'REPEAT';
                        }

                        // STAGE 2: FILLER (3.0s)
                        if (elapsed > 3000 && silenceStageRef.current === 1) {
                            const isSwedish = currentTargetLangRef.current.toLowerCase().includes('svenska');
                            const filler = isSwedish ? "Låt se..." : "Let me see...";
                            sendTextSignal(`[CMD: FILLER "${filler}"]`);
                            silenceStageRef.current = 2;
                            if(audioDiagnosticsRef.current) audioDiagnosticsRef.current.puppeteerState = 'FILLER';
                        }
                        
                        // STAGE 3: HARD CUT (5.0s)
                        if (elapsed > 5000) {
                            if (silenceTimerRef.current) clearInterval(silenceTimerRef.current);
                            // Force flush
                            isSpeakingRef.current = false;
                            flushTurn();
                            if(audioDiagnosticsRef.current) audioDiagnosticsRef.current.puppeteerState = 'CUT';
                        }

                    }, 500);
                }
                
                const speechDurationSec = (now - speechStartTimeRef.current) / 1000;
                
                // Hard Flush Safety (25s)
                if (speechDurationSec > 25.0) {
                    console.log("[AudioInput] ⚠️ Hard Flushing due to >25s speech duration.");
                    isSpeakingRef.current = false;
                    flushTurn();
                    return;
                }
                
                // Hydraulic Logic
                const cSil = silenceThresholdRef.current;
                const damPressure = shieldBufferRef.current.length; 
                const jitterPressure = bufferGapRef.current; 
                
                const momentumLimit = momentumStartRef.current;
                const ghostTol = ghostToleranceRef.current;
                const hasGhostPressure = speechDurationSec > momentumLimit;

                let hydraulicTarget = 275; 

                if (damPressure > 0) {
                    hydraulicTarget = Math.min(cSil * 2, 2000); 
                } else if (hasGhostPressure) {
                    hydraulicTarget = ghostTol; 
                } else if (jitterPressure > 0.1) {
                    hydraulicTarget = Math.max(cSil / 2, 275); 
                } else {
                    hydraulicTarget = 275;
                }

                // The Squeeze
                let currentSilenceThresh = hydraulicTarget;
                if (speechDurationSec > 20) { 
                    const squeezeStart = 20.0;
                    const squeezeEnd = 25.0; 
                    const minFloor = 100;
                    const progress = Math.min(1, Math.max(0, (speechDurationSec - squeezeStart) / (squeezeEnd - squeezeStart)));
                    currentSilenceThresh = hydraulicTarget - ((hydraulicTarget - minFloor) * progress);
                    currentSilenceThresh = Math.max(minFloor, currentSilenceThresh);
                }
                
                if (audioDiagnosticsRef.current) {
                    audioDiagnosticsRef.current.silenceDuration = (now - silenceStartTimeRef.current) / 1000;
                    audioDiagnosticsRef.current.currentSilenceThreshold = currentSilenceThresh;
                    audioDiagnosticsRef.current.ghostActive = hasGhostPressure;
                }

                if (now - silenceStartTimeRef.current > currentSilenceThresh) {
                    // Normal finish via Hydraulics
                    if (silenceTimerRef.current) clearInterval(silenceTimerRef.current);
                    if (audioDiagnosticsRef.current) audioDiagnosticsRef.current.puppeteerState = 'IDLE'; // Reset visually
                    isSpeakingRef.current = false;
                    flushTurn();
                }
            }
        }

        if (isSpeakingRef.current || (mode === 'translate')) {
             if (isSpeakingRef.current) {
                 pcmBufferRef.current.push(chunk);
                 if (audioDiagnosticsRef.current) {
                     audioDiagnosticsRef.current.bufferSize = pcmBufferRef.current.length;
                 }
                 // Stream data (managed by GeminiLive hook)
                 const pcmBlob = createPcmBlob(chunk);
                 onAudioData(pcmBlob.data); 
             }
        }
    }, [busyUntilRef, audioDiagnosticsRef, flushTurn, onAudioData, shieldBufferRef, sendTextSignal]);

    const latestHandlerRef = useRef(handleWorkerResult);
    
    useEffect(() => {
        latestHandlerRef.current = handleWorkerResult;
    }, [handleWorkerResult]);

    // Initialize VAD Worker
    useEffect(() => {
        if (!workerRef.current) {
            try {
                const blob = new Blob([VAD_WORKER_CODE], { type: 'application/javascript' });
                const blobUrl = URL.createObjectURL(blob);
                vadBlobUrlRef.current = blobUrl;

                workerRef.current = new Worker(blobUrl, { type: 'module' });
                
                workerRef.current.onmessage = (e) => {
                    const { command, chunk, prob, rms } = e.data;
                    if (command === 'RESULT') {
                        latestHandlerRef.current(chunk, prob, rms);
                    }
                };
            } catch (e) {
                console.error("Failed to create VAD worker from Blob:", e);
            }
        }
        return () => {
            if (workerRef.current) {
                workerRef.current.terminate();
                workerRef.current = null;
            }
            if (vadBlobUrlRef.current) {
                URL.revokeObjectURL(vadBlobUrlRef.current);
                vadBlobUrlRef.current = null;
            }
        };
    }, []);

    const initAudioInput = useCallback(async (forceActive = false) => {
        if (inputContextRef.current && inputContextRef.current.state === 'running') return;

        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            inputContextRef.current = ctx;

            // Prepare Input Worklet Blob
            if (!inputWorkletBlobUrlRef.current) {
                const blob = new Blob([INPUT_WORKLET_CODE], { type: 'application/javascript' });
                inputWorkletBlobUrlRef.current = URL.createObjectURL(blob);
            }

            // Load Worklet
            await ctx.audioWorklet.addModule(inputWorkletBlobUrlRef.current!);

            // PRO MODE: If enabled, disable all software processing to let Hardware (DSP/Tesira) handle it.
            // If disabled (Default), use standard browser echo cancellation.
            const constraints: MediaTrackConstraints = enableProMode 
                ? {
                    deviceId: inputDeviceId !== 'default' ? { exact: inputDeviceId } : undefined,
                    channelCount: 1,
                    sampleRate: 16000,
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false
                  }
                : {
                    deviceId: inputDeviceId !== 'default' ? { exact: inputDeviceId } : undefined,
                    channelCount: 1,
                    sampleRate: 16000,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                  };

            console.log(`[AudioInput] Requesting Mic with ProMode=${enableProMode}`, constraints);

            const stream = await navigator.mediaDevices.getUserMedia({ audio: constraints });
            streamRef.current = stream;

            const source = ctx.createMediaStreamSource(stream);
            sourceRef.current = source;

            // Create AudioWorkletNode instead of ScriptProcessor
            const workletNode = new AudioWorkletNode(ctx, 'input-processor');
            workletNodeRef.current = workletNode;

            // Handle data from worklet
            workletNode.port.onmessage = (e) => {
                const inputData = e.data; // Float32Array from worklet
                if (workerRef.current) {
                    // Offload to VAD worker
                    workerRef.current.postMessage({
                        command: 'PROCESS',
                        data: inputData,
                        gain: volMultiplierRef.current
                    }, [inputData.buffer]);
                }
            };

            source.connect(workletNode);
            workletNode.connect(ctx.destination); // Keep alive

            if (audioDiagnosticsRef.current) {
                audioDiagnosticsRef.current.audioContextState = 'running';
                audioDiagnosticsRef.current.sampleRate = 16000;
            }

        } catch (e) {
            console.error("Audio Input Init Failed:", e);
            throw e;
        }
    }, [inputDeviceId, audioDiagnosticsRef, enableProMode]);

    const stopAudioInput = useCallback(() => {
        // KILL TIMER
        if (silenceTimerRef.current) {
            clearInterval(silenceTimerRef.current);
            silenceTimerRef.current = null;
        }

        if (workletNodeRef.current) {
            workletNodeRef.current.disconnect();
            workletNodeRef.current.port.onmessage = null;
            workletNodeRef.current = null;
        }
        if (sourceRef.current) {
            sourceRef.current.disconnect();
            sourceRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (inputContextRef.current) {
            inputContextRef.current.close();
            inputContextRef.current = null;
        }
        
        if (audioDiagnosticsRef.current) {
            audioDiagnosticsRef.current.audioContextState = 'closed';
        }
        
        isSpeakingRef.current = false;
        if (workerRef.current) workerRef.current.postMessage({ command: 'RESET' });
        pcmBufferRef.current = [];
    }, [audioDiagnosticsRef]);

    const triggerTestTone = useCallback(() => {
        if (!inputContextRef.current) return;
        const osc = inputContextRef.current.createOscillator();
        osc.frequency.setValueAtTime(440, inputContextRef.current.currentTime);
        osc.connect(inputContextRef.current.destination);
        osc.start();
        osc.stop(inputContextRef.current.currentTime + 0.5);
    }, []);

    const injectTextAsAudio = useCallback(async (text: string): Promise<string> => {
        console.log("[AudioInput] Mock Inject Generating:", text);
        isSpeakingRef.current = true;
        const chunks = 10;
        const chunkSize = 1600; 
        
        for(let i=0; i<chunks; i++) {
            const chunk = new Float32Array(chunkSize).map(() => (Math.random() - 0.5) * 0.05);
            pcmBufferRef.current.push(chunk);
            const pcmBlob = createPcmBlob(chunk);
            onAudioData(pcmBlob.data);
            await new Promise(r => setTimeout(r, 100));
        }

        isSpeakingRef.current = false;
        flushTurn();
        return "Success";
    }, [flushTurn, onAudioData]);

    // Cleanup Blobs on unmount
    useEffect(() => {
        return () => {
            if (inputWorkletBlobUrlRef.current) {
                URL.revokeObjectURL(inputWorkletBlobUrlRef.current);
            }
        };
    }, []);

    return {
        initAudioInput,
        stopAudioInput,
        effectiveMinDuration,
        currentLatency,
        inputContextRef,
        triggerTestTone,
        injectTextAsAudio
    };
}
