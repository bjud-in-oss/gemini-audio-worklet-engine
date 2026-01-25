
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { TurnPackage } from '../types';
import { createPcmBlob } from '../utils/audioUtils';

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
}

// --- BLOB WORKER CODE (Unchanged) ---
const VAD_WORKER_CODE = `
function calculateRMS(data) {
    let sum = 0;
    for(let i=0; i<data.length; i++) sum += data[i] * data[i];
    return Math.sqrt(sum / data.length);
}

class NeuralVad {
    constructor() {
        this.session = null;
        this.ort = null;
        this.h = null;
        this.c = null;
        this.sr = null;
        this.isReady = false;
        this.loadFailed = false;
        this.init();
    }

    async init() {
        try {
            // Dynamic import for ONNX Runtime Web
            let ortModule;
            try {
                ortModule = await import('https://esm.sh/onnxruntime-web@1.19.0');
                this.ort = ortModule.default || ortModule;
            } catch (importErr) {
                console.warn("[NeuralVad] Failed to load ONNX Runtime from CDN.", importErr);
                this.loadFailed = true;
                return;
            }

            if (this.ort && this.ort.env) {
                this.ort.env.wasm.wasmPaths = {
                    'ort-wasm.wasm': 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.19.0/dist/ort-wasm.wasm',
                    'ort-wasm-simd.wasm': 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.19.0/dist/ort-wasm-simd.wasm',
                    'ort-wasm-threaded.wasm': 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.19.0/dist/ort-wasm-threaded.wasm'
                };
            }
            
            const modelUrls = [
                "https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.7/dist/silero_vad.onnx",
                "https://cdn.jsdelivr.net/gh/snakers4/silero-vad@v4.0.0/files/silero_vad.onnx"
            ];

            let modelBuffer = null;

            for (const url of modelUrls) {
                try {
                    const response = await fetch(url);
                    if (response.ok) {
                        modelBuffer = await response.arrayBuffer();
                        break;
                    } 
                } catch (fetchErr) {
                    // Continue
                }
            }

            if (!modelBuffer) {
                console.error("[NeuralVad] All model sources failed.");
                this.loadFailed = true;
                return;
            }

            this.session = await this.ort.InferenceSession.create(modelBuffer, {
                executionProviders: ['wasm'],
                graphOptimizationLevel: 'all'
            });
            
            const zeros = new Float32Array(2 * 1 * 64).fill(0);
            this.h = new this.ort.Tensor('float32', zeros, [2, 1, 64]);
            this.c = new this.ort.Tensor('float32', zeros, [2, 1, 64]);
            this.sr = new this.ort.Tensor('int64', new BigInt64Array([16000n]));
            
            this.isReady = true;
        } catch (e) {
            console.error("[NeuralVad] Critical Init Error:", e);
            this.loadFailed = true; 
        }
    }

    async process(audioFrame) {
        if (this.loadFailed || !this.isReady) {
            let sum = 0;
            for(let i=0; i<audioFrame.length; i++) sum += audioFrame[i] * audioFrame[i];
            const rms = Math.sqrt(sum / audioFrame.length);
            return rms > 0.01 ? 0.8 : 0; 
        }

        if (!this.session || !this.h || !this.c || !this.sr) return 0;

        try {
            const windowSize = 512;
            let maxProb = 0;

            for (let i = 0; i < audioFrame.length; i += windowSize) {
                let chunk = audioFrame.slice(i, i + windowSize);
                if (chunk.length < windowSize) {
                    const padded = new Float32Array(windowSize);
                    padded.set(chunk);
                    chunk = padded;
                }

                const inputTensor = new this.ort.Tensor('float32', chunk, [1, windowSize]);

                const feeds = {
                    input: inputTensor,
                    sr: this.sr,
                    h: this.h,
                    c: this.c
                };

                const results = await this.session.run(feeds);

                this.h = results.hn;
                this.c = results.cn;

                const output = results.output.data[0];
                if (output > maxProb) maxProb = output;
            }

            return maxProb;
        } catch (e) {
            console.error("[NeuralVad] Runtime error", e);
            this.loadFailed = true;
            return 0;
        }
    }
    
    reset() {
        if (this.isReady && this.ort) {
            const zeros = new Float32Array(2 * 1 * 64).fill(0);
            this.h = new this.ort.Tensor('float32', zeros, [2, 1, 64]);
            this.c = new this.ort.Tensor('float32', zeros, [2, 1, 64]);
        }
    }
}

const vad = new NeuralVad();

self.onmessage = async (e) => {
    const { command, data, gain } = e.data;

    if (command === 'PROCESS') {
        const inputFrame = new Float32Array(data);
        const processedFrame = new Float32Array(inputFrame.length);
        const g = typeof gain === 'number' ? gain : 1.0;
        
        for(let i=0; i<inputFrame.length; i++) {
            processedFrame[i] = inputFrame[i] * g;
        }

        const rms = calculateRMS(processedFrame);
        let prob = 0;

        if (rms > 0.002) {
            prob = await vad.process(processedFrame);
        }

        self.postMessage({ 
            command: 'RESULT', 
            chunk: processedFrame, 
            prob, 
            rms 
        }, [processedFrame.buffer]);
    } else if (command === 'RESET') {
        vad.reset();
    }
};
`;

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
    shieldBufferRef
}: UseAudioInputProps) {
    
    const [effectiveMinDuration, setEffectiveMinDuration] = useState(minTurnDuration);
    const [currentLatency, setCurrentLatency] = useState(0);

    const inputContextRef = useRef<AudioContext | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const workerRef = useRef<Worker | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const blobUrlRef = useRef<string | null>(null);

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
    
    const isSpeakingRef = useRef(false);
    const speechStartTimeRef = useRef(0);
    const silenceStartTimeRef = useRef(0);
    
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

        // Note: For injected audio, we might bypass the minSpeechDuration check if it's artificially short
        // but normally we generate enough data.
        if (durationMs > 50) { // Reduced threshold for flush safety
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
        
        // --- STANDARD VAD LOGIC ---
        const effectiveThreshold = vadThresholdRef.current;

        // Hysteresis
        const sustainThreshold = effectiveThreshold * 0.6;
        const activeThreshold = isSpeakingRef.current ? sustainThreshold : effectiveThreshold;

        // Diagnostics
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
            if (!isSpeakingRef.current) {
                isSpeakingRef.current = true;
                speechStartTimeRef.current = now;
            }
            silenceStartTimeRef.current = 0;
        } else {
            if (isSpeakingRef.current) {
                if (silenceStartTimeRef.current === 0) {
                    silenceStartTimeRef.current = now;
                }
                
                const speechDurationSec = (now - speechStartTimeRef.current) / 1000;
                
                // --- HARD FLUSH SAFETY (REVERTED TO 25s) ---
                if (speechDurationSec > 25.0) {
                    console.log("[AudioInput] ⚠️ Hard Flushing due to >25s speech duration.");
                    isSpeakingRef.current = false;
                    flushTurn();
                    return;
                }
                
                // --- HYDRAULIC VAD (Tripp Trapp Trull) ---
                const cSil = silenceThresholdRef.current;
                const damPressure = shieldBufferRef.current.length; // DAM (Physical packets waiting)
                const jitterPressure = bufferGapRef.current; // JIT (Incoming audio gap)
                
                // GHOST PRESSURE (MOMENTUM): 
                const momentumLimit = momentumStartRef.current; // e.g. 3.0s
                const ghostTol = ghostToleranceRef.current; // e.g. 1200ms
                
                const hasGhostPressure = speechDurationSec > momentumLimit;

                let hydraulicTarget = 275; // Base floor (Tripp)

                if (damPressure > 0) {
                    // TRULL (Blockage Mode)
                    // If we have unsent packets, we MUST NOT cut. Max tolerance.
                    hydraulicTarget = Math.min(cSil * 2, 2000); 
                } else if (hasGhostPressure) {
                    // TRULL (Momentum Mode / Ghost Pressure)
                    // If simply speaking long, we allow breath pauses.
                    hydraulicTarget = ghostTol; 
                } else if (jitterPressure > 0.1) {
                    // TRAPP (Listening Mode)
                    // AI is talking, allow user to think (Soft Landing)
                    hydraulicTarget = Math.max(cSil / 2, 275); 
                } else {
                    // TRIPP (Ping Pong Mode)
                    // Fast dialogue
                    hydraulicTarget = 275;
                }

                // --- THE SQUEEZE (Override) ---
                let currentSilenceThresh = hydraulicTarget;

                if (speechDurationSec > 20) { // REVERTED TO 20s START
                    const squeezeStart = 20.0;
                    const squeezeEnd = 25.0; // REVERTED TO 25s END
                    const minFloor = 100;
                    
                    // Linear interpolation 0.0 -> 1.0
                    const progress = Math.min(1, Math.max(0, (speechDurationSec - squeezeStart) / (squeezeEnd - squeezeStart)));
                    
                    // Interpolate from Hydraulic Target down to 100ms
                    currentSilenceThresh = hydraulicTarget - ((hydraulicTarget - minFloor) * progress);
                    currentSilenceThresh = Math.max(minFloor, currentSilenceThresh);
                }
                
                if (audioDiagnosticsRef.current) {
                    audioDiagnosticsRef.current.silenceDuration = (now - silenceStartTimeRef.current) / 1000;
                    audioDiagnosticsRef.current.currentSilenceThreshold = currentSilenceThresh;
                    
                    // NEW: Expose Ghost Status
                    audioDiagnosticsRef.current.ghostActive = hasGhostPressure;
                }

                if (now - silenceStartTimeRef.current > currentSilenceThresh) {
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
                 
                 // STREAMING (Logic moved to useGeminiLive to handle the Shield)
                 const pcmBlob = createPcmBlob(chunk);
                 onAudioData(pcmBlob.data); 
             }
        }
    }, [busyUntilRef, audioDiagnosticsRef, flushTurn, onAudioData, shieldBufferRef]); // Added shieldBufferRef to deps

    const latestHandlerRef = useRef(handleWorkerResult);
    
    useEffect(() => {
        latestHandlerRef.current = handleWorkerResult;
    }, [handleWorkerResult]);

    useEffect(() => {
        if (!workerRef.current) {
            try {
                const blob = new Blob([VAD_WORKER_CODE], { type: 'application/javascript' });
                const blobUrl = URL.createObjectURL(blob);
                blobUrlRef.current = blobUrl;

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
            if (blobUrlRef.current) {
                URL.revokeObjectURL(blobUrlRef.current);
                blobUrlRef.current = null;
            }
        };
    }, []);

    const initAudioInput = useCallback(async (forceActive = false) => {
        if (inputContextRef.current && inputContextRef.current.state === 'running') return;

        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            inputContextRef.current = ctx;

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    deviceId: inputDeviceId !== 'default' ? { exact: inputDeviceId } : undefined,
                    channelCount: 1,
                    sampleRate: 16000,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            streamRef.current = stream;

            const source = ctx.createMediaStreamSource(stream);
            sourceRef.current = source;

            const processor = ctx.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                if (workerRef.current) {
                    workerRef.current.postMessage({
                        command: 'PROCESS',
                        data: inputData,
                        gain: volMultiplierRef.current
                    }, [inputData.buffer]);
                }
            };

            source.connect(processor);
            processor.connect(ctx.destination);

            if (audioDiagnosticsRef.current) {
                audioDiagnosticsRef.current.audioContextState = 'running';
                audioDiagnosticsRef.current.sampleRate = 16000;
            }

        } catch (e) {
            console.error("Audio Input Init Failed:", e);
            throw e;
        }
    }, [inputDeviceId, audioDiagnosticsRef]);

    const stopAudioInput = useCallback(() => {
        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current.onaudioprocess = null;
            processorRef.current = null;
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
        
        // Generate mock audio data so that onAudioData streams it and pcmBuffer fills up.
        // We simulate 10 chunks of 100ms silence/noise.
        const chunks = 10;
        const chunkSize = 1600; // 100ms at 16kHz
        
        for(let i=0; i<chunks; i++) {
            // Low level noise to simulate presence
            const chunk = new Float32Array(chunkSize).map(() => (Math.random() - 0.5) * 0.05);
            
            // 1. Buffer for VAD flush logic
            pcmBufferRef.current.push(chunk);
            
            // 2. Stream immediately to simulate real-time packet arrival
            const pcmBlob = createPcmBlob(chunk);
            onAudioData(pcmBlob.data);
            
            // Wait 100ms between chunks
            await new Promise(r => setTimeout(r, 100));
        }

        isSpeakingRef.current = false;
        // This will now find data in pcmBufferRef and trigger onPhraseDetected
        flushTurn();
        return "Success";
    }, [flushTurn, onAudioData]);

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
