
// We use dynamic imports inside the class to ensure the worker script loads 
// even if external CDNs are blocked or fail.

function calculateRMS(data: Float32Array): number {
    let sum = 0;
    for(let i=0; i<data.length; i++) sum += data[i] * data[i];
    return Math.sqrt(sum / data.length);
}

class NeuralVad {
    private session: any = null;
    private ort: any = null;
    private h: any = null;
    private c: any = null;
    private sr: any = null;
    private isReady = false;
    private loadFailed = false;

    constructor() {
        this.init();
    }

    private async init() {
        try {
            // Dynamic import of ONNX Runtime Web
            try {
                const ortModule = await import('https://esm.sh/onnxruntime-web@1.19.0');
                this.ort = ortModule.default || ortModule;
            } catch (importErr) {
                console.warn("[NeuralVad] Failed to load ONNX Runtime from CDN. Using fallback.", importErr);
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

            let modelBuffer: ArrayBuffer | null = null;

            for (const url of modelUrls) {
                try {
                    const response = await fetch(url);
                    if (response.ok) {
                        modelBuffer = await response.arrayBuffer();
                        break;
                    } 
                } catch (fetchErr) {
                    // Continue to next mirror
                }
            }

            if (!modelBuffer) {
                console.error("[NeuralVad] All model sources failed. Switching to RMS Fallback mode.");
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
            console.error("[NeuralVad] Critical Error during init:", e);
            this.loadFailed = true; 
        }
    }

    public async process(audioFrame: Float32Array): Promise<number> {
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

                const output = results.output.data[0] as number;
                if (output > maxProb) maxProb = output;
            }

            return maxProb;
        } catch (e) {
            console.error("[NeuralVad] Runtime error, switching to fallback", e);
            this.loadFailed = true;
            return 0;
        }
    }
    
    public reset() {
        if (this.isReady && this.ort) {
            const zeros = new Float32Array(2 * 1 * 64).fill(0);
            this.h = new this.ort.Tensor('float32', zeros, [2, 1, 64]);
            this.c = new this.ort.Tensor('float32', zeros, [2, 1, 64]);
        }
    }
}

// --- WORKER SETUP ---

interface WorkerContext {
    onmessage: ((this: WorkerContext, ev: MessageEvent) => any) | null;
    postMessage(message: any, transfer: Transferable[]): void;
}

const ctx = self as unknown as WorkerContext;
const vad = new NeuralVad();

ctx.onmessage = async (e: MessageEvent) => {
    const { command, data, gain } = e.data;

    if (command === 'PROCESS') {
        const inputFrame = new Float32Array(data);
        const processedFrame = new Float32Array(inputFrame.length);
        
        // Apply gain inside worker to save Main Thread CPU
        const g = typeof gain === 'number' ? gain : 1.0;
        // Simple loop for gain application
        for(let i=0; i<inputFrame.length; i++) {
            processedFrame[i] = inputFrame[i] * g;
        }

        const rms = calculateRMS(processedFrame);
        let prob = 0;

        // Optimization: Run VAD only if there is audio energy
        // Lowered threshold slightly to 0.002 to match main thread logic
        if (rms > 0.002) {
            prob = await vad.process(processedFrame);
        }

        ctx.postMessage({ 
            command: 'RESULT', 
            chunk: processedFrame, // Send back processed data (gain applied)
            prob, 
            rms 
        }, [processedFrame.buffer]);
    } else if (command === 'RESET') {
        vad.reset();
    }
};
