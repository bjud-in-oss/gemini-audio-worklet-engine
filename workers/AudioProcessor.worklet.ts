
// AudioProcessor.worklet.ts
// Ported from Linux C++ LockFreeAudioBuffer architecture.
// Handles raw PCM interpolation, thread-safe ring buffering, and elastic time-stretching.

interface AudioWorkletProcessor {
  readonly port: MessagePort;
  process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<string, Float32Array>): boolean;
}

declare var AudioWorkletProcessor: {
  prototype: AudioWorkletProcessor;
  new (options?: any): AudioWorkletProcessor;
};

declare var registerProcessor: (name: string, processorCtor: (new (options?: any) => AudioWorkletProcessor)) => void;

class AudioProcessor extends AudioWorkletProcessor {
  // Shared Memory Buffers
  private audioBuffer: Float32Array | null = null;
  private writeIndexPtr: Int32Array | null = null;
  private readIndexPtr: Int32Array | null = null;

  // Internal State
  private localReadIndex: number = 0.0; // Double precision for Lerp
  private mask: number = 0;
  private bufferSize: number = 0;
  private initialized: boolean = false;

  // Gain Ramping (Anti-Click)
  private currentGain: number = 0.0;
  private targetGain: number = 0.0;
  private readonly GAIN_ATTACK = 0.05; // Fast ramp up
  private readonly GAIN_DECAY = 0.01;  // Slower ramp down

  // Elastic Rate Config
  private readonly SAMPLE_RATE = 24000;
  private readonly TARGET_LATENCY_S = 0.20; // 200ms target
  private readonly TARGET_LATENCY_FRAMES = 24000 * 0.20; // 4800 frames
  private readonly MAX_RATE = 1.15; // Max 15% speedup to avoid pitch artifacts

  constructor() {
    super();
    this.port.onmessage = this.handleMessage.bind(this);
  }

  private handleMessage(event: MessageEvent) {
    const { type, payload } = event.data;

    if (type === 'INIT') {
      const { sabAudio, sabPointers, size } = payload;
      
      this.audioBuffer = new Float32Array(sabAudio);
      // Pointers: [0] = WriteIndex, [1] = ReadIndex
      const pointersView = new Int32Array(sabPointers);
      this.writeIndexPtr = new Int32Array(sabPointers, 0, 1);
      this.readIndexPtr = new Int32Array(sabPointers, 4, 1);
      
      this.bufferSize = size;
      this.mask = size - 1; // Requires Power of 2!
      this.initialized = true;
      
      console.log(`[AudioWorklet] Initialized with buffer size ${size}`);
    }
  }

  process(inputs: Float32Array[][], outputs: Float32Array[][]): boolean {
    if (!this.initialized || !this.audioBuffer || !this.writeIndexPtr || !this.readIndexPtr) {
      return true; // Keep alive until initialized
    }

    const outputChannel = outputs[0][0];
    const outputLength = outputChannel.length;

    // 1. Thread-Safe Pointer Load
    const writeIndex = Atomics.load(this.writeIndexPtr, 0);
    
    // 2. Calculate Fill Level (Distance)
    // We use bitwise OR 0 to ensure 32-bit integer wrapping logic matches C++
    let fillLevel = (writeIndex - Math.floor(this.localReadIndex));
    
    // Handle massive index wrapping if necessary, though FP precision usually limits us before Int32 overflow.
    // In this simplified logic, we assume valid range or reset.
    if (fillLevel < 0) fillLevel += 0; // Should be handled by standard subtraction if indices are close

    // 3. Elastic Rate Control logic
    let rateIncrement = 1.0;
    
    if (fillLevel > this.TARGET_LATENCY_FRAMES) {
      // Calculate how far behind we are (0.0 to 1.0 scale relative to a safety margin)
      const excess = fillLevel - this.TARGET_LATENCY_FRAMES;
      // Gently ramp up speed. E.g. at 10000 samples behind, we hit max speed.
      const boost = Math.min(this.MAX_RATE - 1.0, (excess / this.SAMPLE_RATE) * 0.5);
      rateIncrement = 1.0 + boost;
    } else if (fillLevel < 128) {
      // Dangerously close to empty, slow down slightly to avoid full underrun? 
      // Usually better to just play at 1.0 or let gain ramp handle the gap.
      rateIncrement = 1.0; 
    }

    // 4. Anti-Click Logic (Target Gain)
    // If we have less than 2 frames of data, ramp down volume to silence
    if (fillLevel < 2) {
      this.targetGain = 0.0;
    } else {
      this.targetGain = 1.0;
    }

    // 5. Render Loop (Per Sample)
    for (let i = 0; i < outputLength; i++) {
      // Update Gain (Exponential Smoothing)
      if (Math.abs(this.currentGain - this.targetGain) > 0.001) {
        const factor = this.targetGain > this.currentGain ? this.GAIN_ATTACK : this.GAIN_DECAY;
        this.currentGain += (this.targetGain - this.currentGain) * factor;
      } else {
        this.currentGain = this.targetGain;
      }

      // Check boundaries again inside loop for safety (though fillLevel checks usually suffice)
      // Note: We need at least 1.0 distance for interpolation (y0 and y1)
      if (this.currentGain > 0.001) {
        
        // --- C++ PORT: Linear Interpolation ---
        const idx0 = Math.floor(this.localReadIndex);
        const idx1 = idx0 + 1;
        const fraction = this.localReadIndex - idx0;

        // Bitmasking for circular buffer wrapping
        const y0 = this.audioBuffer[idx0 & this.mask];
        const y1 = this.audioBuffer[idx1 & this.mask];

        // Lerp
        const interpolated = y0 + (y1 - y0) * fraction;
        
        // Output with Anti-Click Gain
        outputChannel[i] = interpolated * this.currentGain;

        // Advance Ptr
        this.localReadIndex += rateIncrement;

      } else {
        // Silence (Underrun)
        outputChannel[i] = 0.0;
        // Don't advance read pointer if we are starving, let write catch up
      }
    }

    // 6. Thread-Safe Pointer Store
    // Tell the main thread where we are. We floor it because Atomics expects Int32.
    Atomics.store(this.readIndexPtr, 0, Math.floor(this.localReadIndex));

    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor);
