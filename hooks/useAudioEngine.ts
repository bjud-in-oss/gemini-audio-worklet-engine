
import { useRef, useState, useCallback, useEffect } from 'react';

// --- OUTPUT AUDIO PROCESSOR WORKLET (Embedded) ---
// Handles Ring Buffer and Elastic Time Stretching via MessagePort (No SharedArrayBuffer)
// This ensures compatibility with environments missing COOP/COEP headers.
const OUTPUT_WORKLET_CODE = `
class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    // Internal Ring Buffer (30 seconds capacity)
    this.bufferSize = 24000 * 30; 
    this.buffer = new Float32Array(this.bufferSize);
    this.writeIndex = 0;
    this.readIndex = 0;
    
    // Config
    this.SAMPLE_RATE = 24000;
    this.TARGET_LATENCY_FRAMES = 24000 * 0.25; // 250ms target latency
    
    // Status reporting throttling
    this.framesSinceLastReport = 0;

    this.port.onmessage = this.handleMessage.bind(this);
  }

  handleMessage(event) {
    const { type, data } = event.data;
    if (type === 'PUSH') {
       this.push(data);
    }
  }

  push(chunk) {
    // Simple Ring Buffer Write
    // Note: chunk is Float32Array
    const len = chunk.length;
    for (let i = 0; i < len; i++) {
        this.buffer[this.writeIndex % this.bufferSize] = chunk[i];
        this.writeIndex++;
    }
  }

  process(inputs, outputs) {
    const outputChannel = outputs[0][0];
    const outputLength = outputChannel.length;
    
    // Calculate Fill Level (Available Samples)
    // JS numbers are doubles (safe integer limit ~9 quadrillion), so simple subtraction works fine for years.
    let available = this.writeIndex - Math.floor(this.readIndex);
    
    // Report status periodically (~100ms)
    this.framesSinceLastReport += outputLength;
    if (this.framesSinceLastReport > 2400) { 
        this.port.postMessage({
            type: 'STATUS',
            samples: available,
            ms: (available / this.SAMPLE_RATE) * 1000
        });
        this.framesSinceLastReport = 0;
    }

    if (available < outputLength) {
        // Underrun - output silence
        for (let i = 0; i < outputLength; i++) outputChannel[i] = 0;
        return true;
    }

    // Elastic Rate Logic
    // If buffer grows too large, speed up slightly to drain it (Catch-up)
    let speed = 1.0;
    if (available > this.TARGET_LATENCY_FRAMES) {
        // Cap speed increase at +15% to avoid chipmunk effect
        const excess = available - this.TARGET_LATENCY_FRAMES;
        const boost = Math.min(0.15, (excess / 24000) * 0.5);
        speed += boost;
    }

    // Read Loop with Linear Interpolation
    for (let i = 0; i < outputLength; i++) {
        const idx = this.readIndex;
        const idxFloor = Math.floor(idx);
        const idxCeil = idxFloor + 1;
        const frac = idx - idxFloor;

        const s0 = this.buffer[idxFloor % this.bufferSize];
        const s1 = this.buffer[idxCeil % this.bufferSize];
        
        // Lerp
        const val = s0 + (s1 - s0) * frac;

        outputChannel[i] = val;
        this.readIndex += speed;
    }

    return true;
  }
}
registerProcessor('audio-processor', AudioProcessor);
`;

const SAMPLE_RATE = 24000;

interface AudioEngineState {
    isReady: boolean;
    audioContext: AudioContext | null;
}

export function useAudioEngine() {
    const [state, setState] = useState<AudioEngineState>({ isReady: false, audioContext: null });
    
    const audioCtxRef = useRef<AudioContext | null>(null);
    const workletNodeRef = useRef<AudioWorkletNode | null>(null);
    const workletBlobUrlRef = useRef<string | null>(null);
    
    // Buffer Status (Updated via messages from worklet)
    const bufferStatusRef = useRef({ samples: 0, ms: 0 });

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
                if (e.data.type === 'STATUS') {
                    bufferStatusRef.current = { samples: e.data.samples, ms: e.data.ms };
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

    const pushPCM = useCallback((base64Data: string) => {
        if (!workletNodeRef.current) return;

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

    const getBufferStatus = useCallback(() => {
        return bufferStatusRef.current;
    }, []);

    const resumeContext = useCallback(async () => {
        if (audioCtxRef.current?.state === 'suspended') {
            await audioCtxRef.current.resume();
        }
    }, []);

    // Cleanup
    useEffect(() => {
        return () => {
            if (workletBlobUrlRef.current) {
                URL.revokeObjectURL(workletBlobUrlRef.current);
            }
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
