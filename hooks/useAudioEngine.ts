
import { useRef, useState, useCallback, useEffect } from 'react';
import { OUTPUT_WORKLET_CODE } from '../utils/workerScripts';

const SAMPLE_RATE = 24000;

interface AudioEngineState {
    isReady: boolean;
    audioContext: AudioContext | null;
}

// GLOBAL REF SINGLETON
// This ensures that regardless of closure scope or re-renders,
// everyone reads the exact same buffer status.
const globalBufferStatus = { samples: 0, ms: 0, speed: 1.0, active: true };

export function useAudioEngine() {
    const [state, setState] = useState<AudioEngineState>({ isReady: false, audioContext: null });
    
    const audioCtxRef = useRef<AudioContext | null>(null);
    const workletNodeRef = useRef<AudioWorkletNode | null>(null);
    const workletBlobUrlRef = useRef<string | null>(null);

    const initAudio = useCallback(async () => {
        if (audioCtxRef.current) return;

        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ 
                sampleRate: SAMPLE_RATE,
                latencyHint: 'interactive'
            });
            audioCtxRef.current = ctx;

            // Load Worklet from Blob
            if (!workletBlobUrlRef.current) {
                const blob = new Blob([OUTPUT_WORKLET_CODE], { type: 'application/javascript' });
                workletBlobUrlRef.current = URL.createObjectURL(blob);
            }
            
            await ctx.audioWorklet.addModule(workletBlobUrlRef.current!);

            const workletNode = new AudioWorkletNode(ctx, 'audio-processor');
            
            // Listen for status updates from the audio thread
            workletNode.port.onmessage = (e) => {
                const msg = e.data;
                
                if (msg.type === 'STATUS') {
                    // Update the global singleton
                    globalBufferStatus.samples = msg.samples;
                    globalBufferStatus.ms = msg.ms;
                    globalBufferStatus.speed = msg.speed || 1.0;
                } 
                else if (msg.type === 'VOICE_STOP') {
                    // ECO MODE: Suspend context to save battery
                    if (ctx.state === 'running') {
                        console.log("[AudioEngine] 🌙 Idle detected. Suspending to save battery.");
                        ctx.suspend().then(() => {
                            globalBufferStatus.active = false;
                        });
                    }
                }
                else if (msg.type === 'VOICE_START') {
                    // WAKE UP: Resume context
                    if (ctx.state === 'suspended') {
                        console.log("[AudioEngine] ☀️ Voice detected. Waking up.");
                        ctx.resume().then(() => {
                            globalBufferStatus.active = true;
                        });
                    }
                }
            };

            workletNode.connect(ctx.destination);
            workletNodeRef.current = workletNode;

            setState({ isReady: true, audioContext: ctx });
            console.log("[AudioEngine] Initialized 24kHz Pipeline (MessagePort Mode)");

        } catch (error) {
            console.error("[AudioEngine] Init Failed:", error);
        }
    }, []);

    const pushPCM = useCallback(async (base64Data: string) => {
        if (!workletNodeRef.current) return;

        // WAKE UP: Ensure engine is running before we push data
        if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
            await audioCtxRef.current.resume();
            globalBufferStatus.active = true;
        }

        // 1. Decode Base64 -> Float32
        const binaryString = atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const int16View = new Int16Array(bytes.buffer);
        
        // Allocate Float32 buffer
        const float32Data = new Float32Array(int16View.length);
        for (let i = 0; i < int16View.length; i++) {
            float32Data[i] = int16View[i] / 32768.0;
        }

        // 2. Send to Worklet via MessagePort (Transferable for zero-copy performance)
        workletNodeRef.current.port.postMessage({
            type: 'PUSH',
            data: float32Data
        }, [float32Data.buffer]); 

    }, []);

    // Directly return the global object reference
    const getBufferStatus = useCallback(() => {
        return globalBufferStatus;
    }, []);

    const resumeContext = useCallback(async () => {
        if (audioCtxRef.current?.state === 'suspended') {
            await audioCtxRef.current.resume();
            globalBufferStatus.active = true;
        }
    }, []);

    // Cleanup
    useEffect(() => {
        return () => {
            if (workletBlobUrlRef.current) {
                URL.revokeObjectURL(workletBlobUrlRef.current);
            }
            // Note: We don't nullify globalBufferStatus here to prevent read errors on unmount
            audioCtxRef.current?.close().catch(e => console.warn("Context close warning:", e));
        };
    }, []);

    return {
        initAudio,
        pushPCM,
        getBufferStatus,
        resumeContext,
        isReady: state.isReady,
        audioContext: state.audioContext
    };
}
