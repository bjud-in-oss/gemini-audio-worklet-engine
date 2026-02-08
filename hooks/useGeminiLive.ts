
import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { TranscriptItem, TurnPackage } from '../types';
import { useTurnQueue } from './useTurnQueue';
import { buildSystemInstruction, injectVariables } from '../utils/promptBuilder';
import { useAudioInput } from './useAudioInput';
import { useAudioEngine } from './useAudioEngine'; 
import { useGeminiSession, ExtendedStatus } from './useGeminiSession';
import { useLiveDiagnostics } from './useLiveDiagnostics';
import { useLiveConfig } from './useLiveConfig';
import { useBackgroundMonitor } from './useBackgroundMonitor';
import { useTranscriptEngine } from './useTranscriptEngine';

// Helper to create 800ms of silence (Base64 PCM) for The Clean Break Protocol
const SILENCE_BURST_B64 = (() => {
    const len = 12800 * 2; 
    const buffer = new Uint8Array(len); // Zeros
    let binary = '';
    for (let i = 0; i < len; i++) { binary += String.fromCharCode(buffer[i]); }
    return btoa(binary);
})();

// UPDATED: Increased from 600 to 800 packets (approx 102 seconds buffer)
const MAX_BUFFER_PACKETS = 800;

// --- DPI: DYNAMIC PERSONA PROMPTS ---
const PERSONA_PROMPTS = {
    NORMAL: '[SYSTEM_UPDATE: Reset speaking style. Speak in a calm, natural, conversational tone with normal pacing.]',
    FAST: '[SYSTEM_UPDATE: Speed up slightly. Remove pauses between sentences. Adopt the persona of a professional news anchor reporting breaking news. Concise and crisp.]',
    ROCKET: '[SYSTEM_UPDATE: URGENT: High latency detected. Speak EXTREMELY FAST. Act like a simultaneous interpreter under high pressure. Prioritize information density. Drop all filler words. Speak as fast as physically possible.]'
};

export function useGeminiLive() {
  // --- TRANSCRIPT ENGINE (Modularized) ---
  const { 
      history, 
      activeTranscript, 
      addTextFragment, 
      finalizeTurn, 
      resetTranscripts 
  } = useTranscriptEngine();

  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  
  // NEW: Jitter Simulation State
  const [isJitterEnabled, setIsJitterEnabled] = useState(false);
  const [jitterIntensity, setJitterIntensity] = useState(200); // Default 200ms
  
  const config = useLiveConfig(); 
  
  const { 
      queueStats, packetEvents, trackSentTurn, trackStreamPacket, 
      trackTurnComplete, resetDiagnostics, updateStats, busyUntilRef,
      latestRtt, lastRttUpdate, setColdStartLimit,
      completionHistoryRef, predictionModelRef
  } = useLiveDiagnostics();

  useEffect(() => {
      setColdStartLimit(config.coldStartSamples);
  }, [config.coldStartSamples, setColdStartLimit]);

  const audioDiagnosticsRef = useRef<any>({
      rms: 0, vadProb: 0, avgVadProb: 0, vadThreshold: 0.5, isSpeaking: false, 
      isBuffering: false, bufferSize: 0, networkEvent: 'idle',
      framesProcessed: 0, audioContextState: 'unknown', activeMode: 'off',
      serverRx: false, sampleRate: 0, wsState: 'CLOSED', bufferGap: 0,
      silenceDuration: 0, currentLatency: 0, busyRemaining: 0,
      queueLength: 0, autoSleepCountdown: 120, connectingBufferSize: 0,
      inFlightCount: 0, timeSinceLastSpeech: 0, audioContextTime: 0,
      rtt: 0, rttAge: 0, volMultiplier: 1.0, silenceThreshold: 500,
      trackReadyState: 'unknown', trackMuted: false,
      isColdStart: true, coldStartLimit: 5,
      modelProcessingRate: 1.0, modelFixedOverhead: 4000, modelSafetyMargin: 2000,
      shieldActive: false, shieldSize: 0, outQueue: 0, currentSilenceThreshold: 500,
      ghostActive: false,
      puppeteerState: 'IDLE' // Ensure this exists for Tower
  });

  const { enqueueTurn, flushQueue, markTurnAsSent, confirmOldestTurn, resetQueue, queueLength, inFlightCount } = useTurnQueue();
  
  // --- INTEGRATION: NEW AUDIO ENGINE ---
  const { 
      initAudio: initAudioEngine, 
      pushPCM, 
      getBufferStatus, 
      resumeContext: resumeAudioEngine,
      audioContext 
  } = useAudioEngine();

  const phraseCounterRef = useRef<number>(0); 
  
  const sentPhrasesCountRef = useRef<number>(0);
  const receivedPhrasesCountRef = useRef<number>(0);
  const lastSpeechTimeRef = useRef<number>(0);
  const isHandshakingRef = useRef<boolean>(false);
  
  const connectingBufferRef = useRef<string[]>([]);
  const shieldBufferRef = useRef<string[]>([]);
  const bufferWarningShownRef = useRef<boolean>(false);
  const pendingEndTurnRef = useRef<boolean>(false);
  const lastResponseTimeRef = useRef<number>(Date.now());

  // DPI STATE
  const currentPersonaRef = useRef<'NORMAL' | 'FAST' | 'ROCKET'>('NORMAL');

  // --- STATE MIRRORS ---
  const stateMirrors = useRef({
      queueLength: 0,
      inFlightCount: 0,
      bufferGap: 0,
      currentLatency: 0,
      outQueueLength: 0,
      activeMode: config.activeMode,
      vadThreshold: config.vadThreshold,
      silenceThreshold: config.silenceThreshold,
      volMultiplier: config.volMultiplier,
      rtt: 0,
      coldStartSamples: config.coldStartSamples
  });

  const transcripts = useMemo(() => {
      if (activeTranscript) {
          const isDuplicate = history.some(t => t.id === activeTranscript.id);
          return isDuplicate ? history : [...history, activeTranscript];
      }
      return history;
  }, [history, activeTranscript]);

  // --- AUDIO HANDLING ---
  const handleAudioData = useCallback((base64Data: string) => {
      trackStreamPacket();
      lastResponseTimeRef.current = Date.now(); 
      
      // JITTER SIMULATOR LOGIC
      if (isJitterEnabled) {
          const delay = Math.random() * jitterIntensity; 
          setTimeout(() => {
              pushPCM(base64Data);
          }, delay);
      } else {
          pushPCM(base64Data);
      }

  }, [pushPCM, trackStreamPacket, isJitterEnabled, jitterIntensity]);

  const handleTextData = useCallback((text: string) => {
      lastResponseTimeRef.current = Date.now(); 
      addTextFragment(text, phraseCounterRef.current);
  }, [addTextFragment]);

  const handleTurnComplete = useCallback(() => {
      lastResponseTimeRef.current = Date.now(); 
      
      let currentBufferGap = 0;
      if (getBufferStatus) {
          currentBufferGap = getBufferStatus().ms / 1000;
      }
      
      // LOGIC UPDATE:
      // Standard Mode: Wait for buffer to drain (< 0.3s) to avoid Echo.
      // Pro Mode: Trust Tesira/Hardware AEC. Drop shield immediately on TurnComplete.
      const shouldDropShield = config.enableProMode || (currentBufferGap < 0.3);
      
      if (confirmOldestTurn()) {
           receivedPhrasesCountRef.current += 1;
           trackTurnComplete(shouldDropShield); 
           
           // THE DEEP BREATH (Fix for Packet Loss & Blind Spot)
           // We increased this from 150ms to 450ms.
           // This forces the system to HOLD the buffered audio for nearly half a second
           // after the AI finishes speaking. This guarantees the server VAD is awake 
           // and ready to listen before we flush the "Dam".
           if (shouldDropShield && shieldBufferRef.current.length > 0) {
               busyUntilRef.current = Date.now() + 450; 
               if ((window as any).APP_LOGS_ENABLED) {
                   console.log("[Live] 🧘 The Deep Breath: Holding flush for 450ms...");
               }
           } else if (config.enableProMode && (window as any).APP_LOGS_ENABLED) {
               console.log("[Live] ⚡ Pro Mode: Shield Dropped (No buffer pressure).");
           }
      }
      finalizeTurn();
  }, [confirmOldestTurn, trackTurnComplete, finalizeTurn, getBufferStatus, config.enableProMode]);

  // Mirrors
  const targetLanguagesRef = useRef(config.targetLanguages);
  const customInstRef = useRef(config.customSystemInstruction);
  const transcriptionEnabledRef = useRef(config.isTranscriptionEnabled);

  useEffect(() => { targetLanguagesRef.current = config.targetLanguages; }, [config.targetLanguages]);
  useEffect(() => { customInstRef.current = config.customSystemInstruction; }, [config.customSystemInstruction]);
  useEffect(() => { transcriptionEnabledRef.current = config.isTranscriptionEnabled; }, [config.isTranscriptionEnabled]);

  const handleServerMessage = useCallback(() => {
      audioDiagnosticsRef.current.serverRx = true;
      lastResponseTimeRef.current = Date.now();
      setTimeout(() => {
          if (audioDiagnosticsRef.current) audioDiagnosticsRef.current.serverRx = false;
      }, 150);
  }, []);

  const sendAudioRef = useRef<(data: string) => boolean>(() => false);
  const sendEndTurnRef = useRef<() => void>(() => {});

  const handleSessionConnect = useCallback(() => {
      setError(null);
      sentPhrasesCountRef.current = 0;
      receivedPhrasesCountRef.current = 0;
      audioDiagnosticsRef.current.wsState = 'OPEN'; 
      resetQueue();
      shieldBufferRef.current = []; 
      lastSpeechTimeRef.current = Date.now();
      bufferWarningShownRef.current = false; 
      currentPersonaRef.current = 'NORMAL'; // Reset persona on connect

      if (connectingBufferRef.current.length > 0) {
          console.log(`[Live] 🚀 Flushing ${connectingBufferRef.current.length} buffered packets on CONNECT`);
          connectingBufferRef.current.forEach(chunk => sendAudioRef.current(chunk));
          connectingBufferRef.current = [];
      }

      if (pendingEndTurnRef.current) {
          console.log("[Live] 🛑 Sending pending EndTurn signal (+Silence Burst)");
          sendAudioRef.current(SILENCE_BURST_B64);
          setTimeout(() => {
              sendEndTurnRef.current();
          }, 50);
          pendingEndTurnRef.current = false;
      }

  }, [resetQueue]);

  // GET sendTextSignal
  const { status, connect: sessionConnect, disconnect: sessionDisconnect, sendAudio, sendEndTurn, sendTextSignal, setStandby } = useGeminiSession({
      onAudioData: handleAudioData,
      onTextData: handleTextData,
      onTurnComplete: handleTurnComplete,
      onError: setError,
      onConnect: handleSessionConnect,
      onDisconnect: () => { audioDiagnosticsRef.current.wsState = 'CLOSED'; },
      onMessageReceived: handleServerMessage
  });

  useEffect(() => {
      sendAudioRef.current = sendAudio;
      sendEndTurnRef.current = sendEndTurn;
  }, [sendAudio, sendEndTurn]);

  useEffect(() => {
      if (status === ExtendedStatus.CONNECTING) audioDiagnosticsRef.current.wsState = 'CONNECTING';
      if (status === ExtendedStatus.CONNECTED) audioDiagnosticsRef.current.wsState = 'OPEN';
      if (status === ExtendedStatus.DISCONNECTED) audioDiagnosticsRef.current.wsState = 'CLOSED';
      if (status === ExtendedStatus.STANDBY) audioDiagnosticsRef.current.wsState = 'STANDBY';
      if (status === ExtendedStatus.RECOVERING) audioDiagnosticsRef.current.wsState = 'RETRYING';
  }, [status]);

  // --- FLUSH SHIELD BUFFER WITH DPI (Dynamic Persona Injection) ---
  const flushShieldBufferFn = useCallback((): number => {
      const count = shieldBufferRef.current.length;
      if (count > 0) {
          
          // --- DPI LOGIC START (COMBINED BUFFER) ---
          // 128ms per chunk (approx) based on 2048 samples @ 16kHz
          const damDurationSec = count * 0.128;
          
          // Get Jitter Buffer duration
          let jitterDurationSec = 0;
          if (getBufferStatus) {
              jitterDurationSec = getBufferStatus().ms / 1000;
          }

          // TOTAL SYSTEM PRESSURE
          const totalDurationSec = damDurationSec + jitterDurationSec;

          let targetPersona: 'NORMAL' | 'FAST' | 'ROCKET' = 'NORMAL';

          // UPDATED THRESHOLDS: Based on TOTAL latency
          if (totalDurationSec > 25.0) {
              targetPersona = 'ROCKET';
          } else if (totalDurationSec > 15.0) {
              targetPersona = 'FAST';
          } else {
              targetPersona = 'NORMAL';
          }

          // Only inject if state changes to avoid spamming the model
          if (targetPersona !== currentPersonaRef.current) {
              console.log(`[DPI] Switching Persona: ${currentPersonaRef.current} -> ${targetPersona} (Total: ${totalDurationSec.toFixed(1)}s [Dam: ${damDurationSec.toFixed(1)}s, Jitter: ${jitterDurationSec.toFixed(1)}s])`);
              
              // Only send signal if we are escalating or de-escalating significantly
              const shouldSend = targetPersona !== 'NORMAL' || currentPersonaRef.current !== 'NORMAL';
              
              if (shouldSend) {
                  const prompt = PERSONA_PROMPTS[targetPersona];
                  // Send text signal BEFORE the audio flush
                  sendTextSignal(prompt + " [SYSTEM_COMMAND: EXECUTE SILENTLY]");
                  
                  if (targetPersona === 'ROCKET') setNotification("DPI: Rocket Mode (Catch-Up)");
                  else if (targetPersona === 'FAST') setNotification("DPI: Fast Mode");
              }
              
              currentPersonaRef.current = targetPersona;
          }
          // --- DPI LOGIC END ---

          if (audioDiagnosticsRef.current) {
              audioDiagnosticsRef.current.networkEvent = 'flush';
              setTimeout(() => {
                  if (audioDiagnosticsRef.current && audioDiagnosticsRef.current.networkEvent === 'flush') {
                      audioDiagnosticsRef.current.networkEvent = 'idle';
                  }
              }, 150);
          }
          shieldBufferRef.current.forEach(chunk => sendAudio(chunk));
          shieldBufferRef.current = [];
      }
      return count;
  }, [sendAudio, sendTextSignal, getBufferStatus]);

  const handleStreamingAudio = useCallback((base64Audio: string) => {
      const now = Date.now();
      
      // --- DIRECT LINE: POLL ENGINE DIRECTLY ---
      let currentBufferGap = 0;
      if (getBufferStatus) {
          const status = getBufferStatus();
          currentBufferGap = status.ms / 1000;
          if (audioDiagnosticsRef.current) {
              audioDiagnosticsRef.current.bufferGap = currentBufferGap;
          }
      }
      
      // HYDRAULIC LATCH
      // In Pro Mode, we rely less on the Latch because we trust TurnComplete.
      // But we keep it as a backup for extreme network lag.
      if (currentBufferGap > 0.3) {
          busyUntilRef.current = Math.max(busyUntilRef.current, now + 500);
      }
      
      const isNetworkBusy = now < busyUntilRef.current;
      const isShieldActive = isNetworkBusy;

      if (status === ExtendedStatus.CONNECTED) {
          if (isShieldActive) {
              shieldBufferRef.current.push(base64Audio);
          } else {
              if (audioDiagnosticsRef.current) {
                  audioDiagnosticsRef.current.networkEvent = 'normal';
                  setTimeout(() => {
                      if (audioDiagnosticsRef.current && audioDiagnosticsRef.current.networkEvent === 'normal') {
                          audioDiagnosticsRef.current.networkEvent = 'idle';
                      }
                  }, 100);
              }
              
              // FLUSH LOGIC
              // We just flush the buffer. We DO NOT force EndTurn.
              // "The Stitch": Buffered audio is prepended to live audio.
              flushShieldBufferFn();
              
              if (connectingBufferRef.current.length > 0) {
                  connectingBufferRef.current.forEach(chunk => sendAudio(chunk));
                  connectingBufferRef.current = [];
              }
              sendAudio(base64Audio);
          }
      } else if (status === ExtendedStatus.CONNECTING || isHandshakingRef.current) {
          connectingBufferRef.current.push(base64Audio);
          if (connectingBufferRef.current.length > MAX_BUFFER_PACKETS) {
              connectingBufferRef.current.shift();
              if (!bufferWarningShownRef.current) {
                  setNotification(`Buffert full (>${MAX_BUFFER_PACKETS} pkt). Tömmer gammalt ljud...`);
                  bufferWarningShownRef.current = true;
                  setTimeout(() => { bufferWarningShownRef.current = false; }, 10000);
              }
          }
      }
  }, [status, sendAudio, busyUntilRef, flushShieldBufferFn, getBufferStatus, config.enableProMode]); // Removed sendEndTurn dependency here

  // --- THE DAM RELEASE LOGIC (DIRECT LINE) ---
  useEffect(() => {
      const shieldInterval = setInterval(() => {
          if (status !== ExtendedStatus.CONNECTED) return;

          const now = Date.now();
          
          let currentBufferGap = 0;
          if (getBufferStatus) {
              const status = getBufferStatus();
              currentBufferGap = status.ms / 1000;
              if (audioDiagnosticsRef.current) {
                  audioDiagnosticsRef.current.bufferGap = currentBufferGap;
              }
          }
          
          if (currentBufferGap > 0.3) {
              busyUntilRef.current = Math.max(busyUntilRef.current, now + 500);
          }

          const isShieldActive = now < busyUntilRef.current;

          if (!isShieldActive) {
              const damSize = shieldBufferRef.current.length;
              if (damSize > 0) {
                  // FLUSH WITHOUT END_TURN
                  // This stitches the dam content with whatever comes next.
                  const count = flushShieldBufferFn();
                  if (config.enableProMode && (window as any).APP_LOGS_ENABLED) {
                      console.log(`[Live] 🌊 Dam Flushed (${count} packets). Stitching to stream.`);
                  }
              }

              // ONLY Send EndTurn if the VAD specifically requested it
              if (pendingEndTurnRef.current) {
                  if ((window as any).APP_LOGS_ENABLED) {
                      console.log("[Live] 🛡️ Shield Dropped. Executing VAD-triggered EndTurn.");
                  }
                  sendAudio(SILENCE_BURST_B64);
                  setTimeout(() => {
                      sendEndTurn();
                  }, 50);
                  pendingEndTurnRef.current = false;
              }
          }
      }, 50); 
      return () => clearInterval(shieldInterval);
  }, [status, busyUntilRef, flushShieldBufferFn, sendAudio, sendEndTurn, getBufferStatus, config.enableProMode]);

  const connectRef = useRef<(isWakeup?: boolean) => Promise<void>>(async () => {});

  const handlePhraseDetected = useCallback((turn: TurnPackage) => {
      lastSpeechTimeRef.current = Date.now();
      
      if ((status === ExtendedStatus.STANDBY || status === ExtendedStatus.DISCONNECTED) && config.activeMode !== 'off') {
          if (!isHandshakingRef.current) {
              connectRef.current(true); 
          }
      }

      phraseCounterRef.current += 1;
      enqueueTurn(turn);
      markTurnAsSent(turn.id);
      
      audioDiagnosticsRef.current.queueLength = queueLength + 1; 
      trackSentTurn(turn.id, turn.durationMs);

      // --- DIRECT LINE CHECK ---
      const now = Date.now();
      let currentBufferGap = 0;
      if (getBufferStatus) {
          currentBufferGap = getBufferStatus().ms / 1000;
      }
      
      if (currentBufferGap > 0.3) {
          busyUntilRef.current = Math.max(busyUntilRef.current, now + 500);
      }
      
      const isShieldActive = now < busyUntilRef.current;

      if (status === ExtendedStatus.CONNECTED) {
          if (isShieldActive) {
              if ((window as any).APP_LOGS_ENABLED) {
                  console.log(`[Live] 🛡️ Shield Active. Gap: ${currentBufferGap.toFixed(2)}s. Queueing EndTurn.`);
              }
              pendingEndTurnRef.current = true;
          } else {
              flushShieldBufferFn();
              sendAudio(SILENCE_BURST_B64);
              setTimeout(() => {
                  sendEndTurn();
              }, 50);
          }
      } else {
          pendingEndTurnRef.current = true;
      }

  }, [status, enqueueTurn, markTurnAsSent, queueLength, trackSentTurn, config.activeMode, sendEndTurn, flushShieldBufferFn, sendAudio, busyUntilRef, getBufferStatus]); 

  // PASS PUPPETEER PROPS
  const { initAudioInput, stopAudioInput, effectiveMinDuration, currentLatency, inputContextRef, triggerTestTone, injectTextAsAudio } = useAudioInput({
      activeMode: config.activeMode,
      vadThreshold: config.vadThreshold,
      minTurnDuration: config.minTurnDuration,
      silenceThreshold: config.silenceThreshold, 
      elasticityStart: config.elasticityStart, 
      minSpeechDuration: config.minSpeechDuration,
      volMultiplier: config.volMultiplier,
      momentumStart: config.momentumStart,
      ghostTolerance: config.ghostTolerance,
      inputDeviceId: config.inputDeviceId,
      isPlaying: false, // Legacy param
      busyUntilRef,
      onPhraseDetected: handlePhraseDetected,
      onAudioData: handleStreamingAudio,
      debugMode: config.debugMode,
      audioDiagnosticsRef,
      bufferGap: 0, 
      shieldBufferRef,
      enableProMode: config.enableProMode,
      sendTextSignal, 
      targetLanguage: config.targetLanguages[0] || 'English'
  });

  const disconnect = useCallback(() => {
      sessionDisconnect();
      stopAudioInput(); 
      resetDiagnostics();
      resetQueue(); 
      resetTranscripts(); 
      shieldBufferRef.current = []; 
      sentPhrasesCountRef.current = 0;
      receivedPhrasesCountRef.current = 0;
      phraseCounterRef.current = 0; 
      connectingBufferRef.current = [];
      pendingEndTurnRef.current = false;
      isHandshakingRef.current = false;
      currentPersonaRef.current = 'NORMAL';
  }, [sessionDisconnect, resetDiagnostics, stopAudioInput, resetQueue, resetTranscripts]); 

  const connect = useCallback(async (isWakeup = false) => {
      if (isHandshakingRef.current) return;
      isHandshakingRef.current = true;

      const apiKey = process.env.API_KEY;
      
      // CRITICAL FIX: Inject dynamic variables into custom instruction at runtime
      // IF custom instruction exists, inject. IF NOT, build default from presets.
      const languages = targetLanguagesRef.current;
      const l1 = languages[0] || 'Svenska';
      const l2 = languages[1] || 'English';
      
      let sysInstruct = customInstRef.current;
      
      if (sysInstruct) {
          // If user has custom text (with {{L1}}), resolve it now
          sysInstruct = injectVariables(sysInstruct, l1, l2);
      } else {
          // If no custom text, build default template (Puppeteer)
          sysInstruct = buildSystemInstruction(languages, 'puppeteer');
      }

      if (isWakeup) setNotification("Vaknar..."); else setNotification("Startar...");

      if (status === ExtendedStatus.CONNECTED) {
          isHandshakingRef.current = false;
          return;
      }

      sessionDisconnect();
      await new Promise(r => setTimeout(r, 200));

      try {
          await initAudioEngine();
          if (!inputContextRef.current || inputContextRef.current.state === 'closed') {
              await initAudioInput(true); 
          } else if (inputContextRef.current.state === 'suspended') {
              await inputContextRef.current.resume();
          }

          await sessionConnect({ 
              apiKey, 
              systemInstruction: sysInstruct, 
              voiceName: 'Puck',
              enableTranscription: transcriptionEnabledRef.current 
          });
          
          if (isWakeup) await new Promise(r => setTimeout(r, 500)); 
          else await new Promise(r => setTimeout(r, 800));

          setNotification("Ansluten!");
          setTimeout(() => setNotification(null), 2000);

      } catch (e) {
          setError("Kunde inte ansluta.");
      } finally {
          isHandshakingRef.current = false;
      }
  }, [sessionConnect, sessionDisconnect, inputContextRef, initAudioInput, status, initAudioEngine]);

  const simulateNetworkDrop = useCallback(() => {
      sessionDisconnect(); 
  }, [sessionDisconnect]);

  useEffect(() => { connectRef.current = connect; }, [connect]);

  useEffect(() => {
      if (status === ExtendedStatus.STANDBY && lastSpeechTimeRef.current > 0) {
          const now = Date.now();
          if (now - lastSpeechTimeRef.current < 500 && !isHandshakingRef.current) connect(true);
      }
  }, [lastSpeechTimeRef.current, status, connect]); 

  useEffect(() => {
      const interval = setInterval(() => {
          const now = Date.now();
          if (inFlightCount > 0) {
              const silentFor = now - lastResponseTimeRef.current;
              if (silentFor > 5000) {
                  resetQueue();
                  lastResponseTimeRef.current = now;
              }
          }
      }, 4000); 
      return () => clearInterval(interval);
  }, [inFlightCount, resetQueue, status]);

  useEffect(() => { 
      updateStats(sentPhrasesCountRef.current, receivedPhrasesCountRef.current, queueLength, inFlightCount, 0, 0);
  }, [queueLength, inFlightCount, updateStats]);

  useEffect(() => {
      if (!config.debugMode) return;

      const timerInterval = setInterval(() => {
          const now = Date.now();
          const d = audioDiagnosticsRef.current;
          const m = stateMirrors.current; 

          // --- VISUAL DIAGNOSTICS ONLY ---
          let currentBufferGap = 0;
          let currentSpeed = 1.0;
          if (getBufferStatus) {
              const status = getBufferStatus();
              currentBufferGap = status.ms / 1000;
              currentSpeed = status.speed || 1.0;
              d.bufferGap = currentBufferGap;
              d.outQueue = status.samples;
          }
          
          d.shieldActive = (now < busyUntilRef.current);
          d.busyRemaining = Math.max(0, busyUntilRef.current - now);
          d.timeSinceLastSpeech = now - lastSpeechTimeRef.current;
          d.silenceDuration = d.timeSinceLastSpeech / 1000;
          d.autoSleepCountdown = Math.max(0, config.autoSleepTimeout - (d.timeSinceLastSpeech / 1000));
          d.rttAge = now - lastRttUpdate;
          
          if (audioContext && audioContext.state === 'running') {
              d.audioContextTime = audioContext.currentTime;
          }

          d.connectingBufferSize = connectingBufferRef.current.length;
          d.shieldSize = shieldBufferRef.current.length;
          d.queueLength = m.queueLength;
          d.inFlightCount = m.inFlightCount;
          d.currentLatency = m.currentLatency;
          d.rtt = m.rtt;
          d.activeMode = m.activeMode;
          d.vadThreshold = m.vadThreshold;
          d.silenceThreshold = m.silenceThreshold;
          d.volMultiplier = m.volMultiplier;

          const currentSamples = completionHistoryRef.current.length;
          const limit = m.coldStartSamples;
          d.isColdStart = currentSamples < limit;
          d.coldStartLimit = limit;
          
          const model = predictionModelRef.current;
          d.modelProcessingRate = model.expansionRate;
          d.modelFixedOverhead = model.fixedOverhead;
          d.modelSafetyMargin = model.safetyMargin;

      }, 100); 

      return () => clearInterval(timerInterval);
  }, [
      config.debugMode, config.autoSleepTimeout, busyUntilRef, lastSpeechTimeRef, lastRttUpdate, audioContext, getBufferStatus
  ]);

  const setMode = useCallback(async (mode: 'translate' | 'pause' | 'off') => {
      config.setActiveMode(mode);

      if (mode === 'off') {
          disconnect();
      } else if (mode === 'pause') {
          if (status === ExtendedStatus.DISCONNECTED || status === ExtendedStatus.STANDBY) {
              setNotification("Förbereder (Paus)...");
              try {
                  await resumeAudioEngine();
                  await initAudioInput(true);
                  await connect(false); 
              } catch(e) { disconnect(); }
          }
      } else {
          if (status === ExtendedStatus.DISCONNECTED || status === ExtendedStatus.STANDBY) {
              disconnect(); 
              await new Promise(r => setTimeout(r, 100));
              try {
                  setNotification("Initierar ljud...");
                  await resumeAudioEngine();
                  await initAudioInput(true);
                  await connect(false); 
              } catch (e) {
                  setError("Kunde inte starta ljudet.");
                  disconnect();
              }
          } else if (status === ExtendedStatus.CONNECTED) {
              await resumeAudioEngine();
              setNotification("Aktiv!");
              setTimeout(() => setNotification(null), 1000);
          }
      }
  }, [disconnect, initAudioInput, connect, config.setActiveMode, resumeAudioEngine, status]);

  useBackgroundMonitor({
      activeMode: config.activeMode,
      status,
      queueLength,
      inFlightCount,
      bufferGap: 0,
      lastSpeechTimeRef,
      actions: {
          setStandby,
          connect: () => connect(true), 
          flushAndSend: () => { flushQueue(); },
          setNotification
      },
      isBuffering: audioDiagnosticsRef.current.connectingBufferSize > 0 || audioDiagnosticsRef.current.bufferSize > 0 || audioDiagnosticsRef.current.shieldSize > 0
  });

  useEffect(() => {
      // Fetch latest speed from buffer
      let speed = 1.0;
      if (getBufferStatus) {
          speed = getBufferStatus().speed || 1.0;
      }

      stateMirrors.current = {
          queueLength,
          inFlightCount,
          bufferGap: 0,
          currentLatency,
          outQueueLength: 0,
          activeMode: config.activeMode,
          vadThreshold: config.vadThreshold,
          silenceThreshold: config.silenceThreshold,
          volMultiplier: config.volMultiplier,
          rtt: latestRtt,
          coldStartSamples: config.coldStartSamples
      };
  }, [
      queueLength, inFlightCount, currentLatency,
      config.activeMode, config.vadThreshold, config.silenceThreshold, config.volMultiplier,
      latestRtt, config.coldStartSamples, getBufferStatus
  ]);

  // Use a timer to update currentPlaybackRate regularly for UI
  const [displayedPlaybackRate, setDisplayedPlaybackRate] = useState(1.0);
  useEffect(() => {
      const interval = setInterval(() => {
          if (getBufferStatus) {
              setDisplayedPlaybackRate(getBufferStatus().speed || 1.0);
          }
      }, 500);
      return () => clearInterval(interval);
  }, [getBufferStatus]);

  return {
    status, transcripts, error, queueStats, 
    currentPlaybackRate: displayedPlaybackRate, 
    paceStatus: 'Managed by Worklet', 
    currentLatency, packetEvents, notification, effectiveMinDuration,
    activePhraseTiming: null, 
    setMode, audioDiagnosticsRef, 
    triggerTestTone, injectTextAsAudio, initAudioInput, connect, disconnect,
    simulateNetworkDrop,
    audioContext, 
    getBufferStatus,
    isJitterEnabled, setIsJitterEnabled,
    jitterIntensity, setJitterIntensity, 
    ...config 
  };
}
