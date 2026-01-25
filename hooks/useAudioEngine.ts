
import { useRef, useState, useCallback, useEffect } from 'react';
// @ts-ignore
import AudioProcessorUrl from '../workers/AudioProcessor.worklet.ts?worker&url';

// Configuration matches the C++ RingBuffer logic
const SAMPLE_RATE = 24000;
const BUFFER_SIZE = 8192; // Power of 2 required for bitmasking
const MASK = BUFFER_SIZE - 1;

interface AudioEngineState {
    isReady: boolean;
    audioContext: AudioContext | null;
}

export function useAudioEngine() {
    const [state, setState] = useState<AudioEngineState>({ isReady: false, audioContext: null });
    
    // Refs for Lock-Free Ring Buffer
    const audioCtxRef = useRef<AudioContext | null>(null);
    const sabAudioRef = useRef<SharedArrayBuffer | null>(null);
    const sabPointersRef = useRef<SharedArrayBuffer | null>(null);
    
    // Typed Views
    const audioViewRef = useRef<Float32Array | null>(null);
    const pointersViewRef = useRef<Int32Array | null>(null); // [0] = Write, [1] = Read

    // Worklet Node
    const workletNodeRef = useRef<AudioWorkletNode | null>(null);

    // Initialization
    const initAudio = useCallback(async () => {
        if (audioCtxRef.current) return;

        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ 
                sampleRate: SAMPLE_RATE,
                latencyHint: 'interactive'
            });
            audioCtxRef.current = ctx;

            // 1. Memory Allocation
            // Audio Data: 8192 float32s (32KB)
            const sabAudio = new SharedArrayBuffer(BUFFER_SIZE * 4);
            const audioView = new Float32Array(sabAudio);
            
            // Pointers: 2 int32s (8 bytes) -> WriteIndex, ReadIndex
            const sabPointers = new SharedArrayBuffer(2 * 4);
            const pointersView = new Int32Array(sabPointers);

            sabAudioRef.current = sabAudio;
            audioViewRef.current = audioView;
            sabPointersRef.current = sabPointers;
            pointersViewRef.current = pointersView;

            // 2. Load Worklet
            // We use strict relative paths to avoid alias resolution issues in the browser.
            try {
                await ctx.audioWorklet.addModule(AudioProcessorUrl);
            } catch (e) {
                console.error("Failed to load worklet module:", e);
                throw e;
            }

            // 3. Initialize Processor Node
            const workletNode = new AudioWorkletNode(ctx, 'audio-processor', {
                processorOptions: {
                    // Options if needed
                }
            });

            // 4. Handshake: Send Shared Memory to Worklet
            workletNode.port.postMessage({
                type: 'INIT',
                payload: {
                    sabAudio,
                    sabPointers,
                    size: BUFFER_SIZE
                }
            });

            workletNode.connect(ctx.destination);
            workletNodeRef.current = workletNode;

            setState({ isReady: true, audioContext: ctx });
            console.log("[AudioEngine] Initialized 24kHz Pipeline with SharedArrayBuffer");

        } catch (error) {
            console.error("[AudioEngine] Init Failed:", error);
        }
    }, []);

    // The Producer: Pushes raw PCM into the Ring Buffer
    const pushPCM = useCallback((base64Data: string) => {
        if (!audioViewRef.current || !pointersViewRef.current) return;

        // 1. Decode Base64 -> Binary String
        const binaryString = atob(base64Data);
        const len = binaryString.length;
        
        // 2. Binary String -> Int16Array
        // We create a Uint8 view first to write bytes, then interpret as Int16
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const int16View = new Int16Array(bytes.buffer);

        // 3. Get current Atomic Write Pointer
        // We are the ONLY writer to index 0, so strict atomic load isn't purely required for correctness 
        // locally, but good practice.
        let writeIndex = Atomics.load(pointersViewRef.current, 0);

        // 4. Write Loop (Interleaved normalization)
        for (let i = 0; i < int16View.length; i++) {
            // Normalize Int16 (-32768 to 32767) to Float32 (-1.0 to 1.0)
            const floatSample = int16View[i] / 32768.0;
            
            // Circular Buffer Write
            // Uses bitmasking for speed (requires Power of 2 size)
            audioViewRef.current[writeIndex & MASK] = floatSample;
            
            writeIndex++;
        }

        // 5. Atomic Commit
        // This makes the new writeIndex visible to the AudioWorklet thread immediately
        Atomics.store(pointersViewRef.current, 0, writeIndex);

    }, []);

    // Diagnostics
    const getBufferStatus = useCallback(() => {
        if (!pointersViewRef.current) return { samples: 0, ms: 0 };

        const writeIndex = Atomics.load(pointersViewRef.current, 0);
        const readIndex = Atomics.load(pointersViewRef.current, 1);
        
        const diff = writeIndex - readIndex;
        // 24000 Hz sample rate
        const ms = (diff / SAMPLE_RATE) * 1000;

        return {
            samples: diff,
            ms: ms
        };
    }, []);

    const resumeContext = useCallback(async () => {
        if (audioCtxRef.current?.state === 'suspended') {
            await audioCtxRef.current.resume();
        }
    }, []);

    // Cleanup
    useEffect(() => {
        return () => {
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
