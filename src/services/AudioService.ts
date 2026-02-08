
import { IAudioService } from './interfaces';

const INPUT_SAMPLE_RATE = 16000; 
const VAD_THRESHOLD = 0.015;     
const VAD_HANGOVER_TIME = 500;   
const BUFFER_SIZE = 4096;        

class VoiceActivityDetector {
  private isSpeaking: boolean = false;
  private lastActivityTime: number = 0;
  private callback: ((active: boolean) => void) | null = null;

  public setCallback(cb: (active: boolean) => void) {
    this.callback = cb;
  }

  public process(data: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i] * data[i];
    }
    const rms = Math.sqrt(sum / data.length);
    const now = Date.now();

    if (rms > VAD_THRESHOLD) {
      this.lastActivityTime = now;
      if (!this.isSpeaking) {
        this.isSpeaking = true;
        this.emitChange(true);
      }
    } else {
      if (this.isSpeaking && (now - this.lastActivityTime > VAD_HANGOVER_TIME)) {
        this.isSpeaking = false;
        this.emitChange(false);
      }
    }
    return rms; 
  }

  private emitChange(isActive: boolean) {
    if (this.callback) this.callback(isActive);
  }
}

function downsampleBuffer(
  buffer: Float32Array, 
  sourceRate: number, 
  targetRate: number
): Float32Array {
  if (targetRate === sourceRate) return buffer;
  if (targetRate > sourceRate) throw new Error("Upsampling not supported in this utility");

  const ratio = sourceRate / targetRate;
  const newLength = Math.round(buffer.length / ratio);
  const result = new Float32Array(newLength);
  
  for (let i = 0; i < newLength; i++) {
    const originalIndex = i * ratio;
    const indexFloor = Math.floor(originalIndex);
    const indexCeil = Math.ceil(originalIndex);
    const weight = originalIndex - indexFloor;
    const val1 = buffer[indexFloor] || 0;
    const val2 = buffer[indexCeil] || val1; 
    result[i] = val1 * (1 - weight) + val2 * weight;
  }
  return result;
}

export class AudioService implements IAudioService {
  private inputContext: AudioContext | null = null;
  private outputContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private inputGain: GainNode | null = null;
  
  private vad: VoiceActivityDetector;
  private currentVolume: number = 0;
  private nextStartTime: number = 0;

  constructor() {
    this.vad = new VoiceActivityDetector();
  }

  private ensureContexts() {
    if (!this.inputContext) {
      this.inputContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (!this.outputContext) {
      this.outputContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000 
      });
    }
  }

  public async getDevices(): Promise<MediaDeviceInfo[]> {
    try {
      // Request access first to get labels
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(d => d.kind === 'audioinput' || d.kind === 'audiooutput');
    } catch (e) {
      console.warn("Could not enumerate devices", e);
      return [];
    }
  }

  public async setOutputDevice(deviceId: string): Promise<void> {
    this.ensureContexts();
    if (!this.outputContext) return;
    if (typeof (this.outputContext as any).setSinkId === 'function') {
      try {
        await (this.outputContext as any).setSinkId(deviceId);
        console.log(`[AudioService] Output routed to ${deviceId}`);
      } catch (e) {
        console.error("Failed to set output device", e);
      }
    } else {
      console.warn("setSinkId not supported on this browser's AudioContext");
    }
  }

  public async startCapture(
    onAudioData: (data: Float32Array) => void, 
    deviceId?: string,
    isProMode: boolean = false
  ): Promise<void> {
    this.ensureContexts();
    if (!this.inputContext) throw new Error("AudioContext failed to initialize");
    this.stopCapture();

    try {
      // PRO MODE LOGIC:
      // If Pro Mode is ON, we disable browser processing (echoCancellation, etc.)
      // trusting that the external DSP (Tesira) handles it.
      const processingEnabled = !isProMode;

      const constraints: MediaStreamConstraints = { 
        audio: { 
          deviceId: deviceId ? { exact: deviceId } : undefined,
          // If Pro Mode is ON, these are FALSE (Raw Audio).
          // If Pro Mode is OFF, these are TRUE (Browser handles it).
          echoCancellation: processingEnabled, 
          noiseSuppression: processingEnabled,
          autoGainControl: processingEnabled,
          // Optional: High sample rate if Pro Mode to ensure quality
          sampleRate: isProMode ? 48000 : undefined 
        } 
      };

      console.log(`[AudioService] Starting capture. ProMode: ${isProMode}. Constraints:`, constraints);

      this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      const source = this.inputContext.createMediaStreamSource(this.mediaStream);
      this.inputGain = this.inputContext.createGain();
      this.scriptProcessor = this.inputContext.createScriptProcessor(BUFFER_SIZE, 1, 1);

      this.scriptProcessor.onaudioprocess = (event) => {
        const inputBuffer = event.inputBuffer.getChannelData(0);
        this.currentVolume = this.vad.process(inputBuffer);
        const sourceRate = this.inputContext!.sampleRate;
        const resampledData = downsampleBuffer(inputBuffer, sourceRate, INPUT_SAMPLE_RATE);
        onAudioData(resampledData);
      };

      source.connect(this.inputGain);
      this.inputGain.connect(this.scriptProcessor);
      this.scriptProcessor.connect(this.inputContext.destination);

    } catch (error) {
      console.error("Error starting audio capture:", error);
      throw error;
    }
  }

  public stopCapture(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    if (this.scriptProcessor && this.inputContext) {
      this.scriptProcessor.disconnect();
      this.scriptProcessor = null;
    }
  }

  public playAudioQueue(audioData: Float32Array, sampleRate: number): void {
    this.ensureContexts();
    if (!this.outputContext) return;

    const buffer = this.outputContext.createBuffer(1, audioData.length, sampleRate);
    buffer.getChannelData(0).set(audioData);

    const source = this.outputContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.outputContext.destination);

    const currentTime = this.outputContext.currentTime;
    if (this.nextStartTime < currentTime) {
      this.nextStartTime = currentTime + 0.05; 
    }

    source.start(this.nextStartTime);
    this.nextStartTime += buffer.duration;
  }

  public onVoiceActivity(callback: (active: boolean) => void): void {
    this.vad.setCallback(callback);
  }

  public getVolumeLevel(): number {
    return Math.min(100, Math.round(this.currentVolume * 500)); 
  }
}
