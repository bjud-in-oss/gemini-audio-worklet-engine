
import { useRef, useState, useCallback, useEffect } from 'react';

// --- OUTPUT AUDIO PROCESSOR WORKLET (Embedded) ---
// Handles Ring Buffer and Elastic Time Stretching
const OUTPUT_WORKLET_CODE = `
class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.audioBuffer = null;
    this.writeIndexPtr = null;
    this.readIndexPtr = null;
    this.localReadIndex = 0.0;
    this.mask = 0;
    this.bufferSize = 0;
    this.initialized = false;
    this.currentGain = 0.0;
    this.targetGain = 0.0;
    this.GAIN_ATTACK = 0.05;
    this.GAIN_DECAY = 0.01;
    this.SAMPLE_RATE = 24000;
    this.TARGET_LATENCY_FRAMES = 24000 * 0.20;
    this.MAX_RATE = 1.15;
    this.port.onmessage = this.handleMessage.bind(this);
  }

  handleMessage(event) {
    const { type, payload } = event.data;
    if (type === 'INIT') {
      const { sabAudio, sabPointers, size } = payload;
      this.audioBuffer = new Float32Array(sabAudio);
      this.writeIndexPtr = new Int32Array(sabPointers, 0, 1);
      this.readIndexPtr = new Int32Array(sabPointers, 4, 1);
      this.bufferSize = size;
      this.mask = size - 1;
      this.initialized = true;
    }
  }

  process(inputs, outputs) {
    if (!this.initialized || !this.audioBuffer) return true;

    const outputChannel = outputs[0][0];
    const outputLength = outputChannel.length;
    const writeIndex = Atomics.load(this.writeIndexPtr, 0);
    let fillLevel = (writeIndex - Math.floor(this.localReadIndex));
    if (fillLevel < 0) fillLevel += 0;

    let rateIncrement = 1.0;
    if (fillLevel > this.TARGET_LATENCY_FRAMES) {
      const excess = fillLevel - this.TARGET_LATENCY_FRAMES;
      const boost = Math.min(this.MAX_RATE - 1.0, (excess / this.SAMPLE_RATE) * 0.5);
      rateIncrement = 1.0 + boost;
    }

    if (fillLevel < 2) this.targetGain = 0.0; else this.targetGain = 1.0;

    for (let i = 0; i < outputLength; i++) {
      if (Math.abs(this.currentGain - this.targetGain) > 0.001) {
        const factor = this.targetGain > this.currentGain ? this.GAIN_ATTACK : this.GAIN_DECAY;
        this.currentGain += (this.targetGain - this.currentGain) * factor;
      } else {
        this.currentGain = this.targetGain;
      }

      if (this.currentGain > 0.001) {
        const idx0 = Math.floor(this.localReadIndex);
        const idx1 = idx0 + 1;
        const fraction = this.localReadIndex - idx0;
        const y0 = this.audioBuffer[idx0 & this.mask];
        const y1 = this.audioBuffer[idx1 & this.mask];
        const interpolated = y0 + (y1 - y0) * fraction;
        outputChannel[i] = interpolated * this.currentGain;
        this.localReadIndex += rateIncrement;
      } else {
        outputChannel[i] = 0.0;
      }
    }
    Atomics.store(this.readIndexPtr, 0, Math.floor(this.localReadIndex));
    return true;
  }
}
registerProcessor('audio-processor', AudioProcessor);
`;

const SAMPLE_RATE = 24000;
const BUFFER_SIZE = 8192;
const MASK = BUFFER_SIZE - 1;

interface AudioEngineState {
    isReady: boolean;
    audioContext: AudioContext | null;
}

export function useAudioEngine() {
    const [state, setState] = useState<AudioEngineState>({ isReady: false, audioContext: null });
    
    const audioCtxRef = useRef<AudioContext | null>(null);
    const sabAudioRef = useRef<SharedArrayBuffer | null>(null);
    const sabPointersRef = useRef<SharedArrayBuffer | null>(null);
    const audioViewRef = useRef<Float32Array | null>(null);
    const pointersViewRef = useRef<Int32Array | null>(null); 
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

            // Shared Memory setup
            const sabAudio = new SharedArrayBuffer(BUFFER_SIZE * 4);
            const audioView = new Float32Array(sabAudio);
            const sabPointers = new SharedArrayBuffer(2 * 4);
            const pointersView = new Int32Array(sabPointers);

            sabAudioRef.current = sabAudio;
            audioViewRef.current = audioView;
            sabPointersRef.current = sabPointers;
            pointersViewRef.current = pointersView;

            // Load Worklet from Blob
            if (!workletBlobUrlRef.current) {
                const blob = new Blob([OUTPUT_WORKLET_CODE], { type: 'application/javascript' });
                workletBlobUrlRef.current = URL.createObjectURL(blob);
            }
            
            await ctx.audioWorklet.addModule(workletBlobUrlRef.current!);

            const workletNode = new AudioWorkletNode(ctx, 'audio-processor');
            
            workletNode.port.postMessage({
                type: 'INIT',
                payload: { sabAudio, sabPointers, size: BUFFER_SIZE }
            });

            workletNode.connect(ctx.destination);
            workletNodeRef.current = workletNode;

            setState({ isReady: true, audioContext: ctx });
            console.log("[AudioEngine] Initialized 24kHz Pipeline with SharedArrayBuffer");

        } catch (error) {
            console.error("[AudioEngine] Init Failed:", error);
        }
    }, []);

    const pushPCM = useCallback((base64Data: string) => {
        if (!audioViewRef.current || !pointersViewRef.current) return;

        const binaryString = atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const int16View = new Int16Array(bytes.buffer);

        let writeIndex = Atomics.load(pointersViewRef.current, 0);

        for (let i = 0; i < int16View.length; i++) {
            const floatSample = int16View[i] / 32768.0;
            audioViewRef.current[writeIndex & MASK] = floatSample;
            writeIndex++;
        }

        Atomics.store(pointersViewRef.current, 0, writeIndex);
    }, []);

    const getBufferStatus = useCallback(() => {
        if (!pointersViewRef.current) return { samples: 0, ms: 0 };
        const writeIndex = Atomics.load(pointersViewRef.current, 0);
        const readIndex = Atomics.load(pointersViewRef.current, 1);
        const diff = writeIndex - readIndex;
        return { samples: diff, ms: (diff / SAMPLE_RATE) * 1000 };
    }, []);

    const resumeContext = useCallback(async () => {
        if (audioCtxRef.current?.state === 'suspended') {
            await audioCtxRef.current.resume();
        }
    }, []);

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
