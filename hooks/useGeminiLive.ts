
import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { TranscriptItem, TurnPackage } from '../types';
import { useTurnQueue } from './useTurnQueue';
import { buildSystemInstruction } from '../utils/promptBuilder';
import { useAudioInput } from './useAudioInput';
// REPLACED: useAudioPlayer -> useAudioEngine
import { useAudioEngine } from './useAudioEngine'; 
import { useGeminiSession, ExtendedStatus } from './useGeminiSession';
import { useLiveDiagnostics } from './useLiveDiagnostics';
import { useLiveConfig } from './useLiveConfig';
import { useBackgroundMonitor } from './useBackgroundMonitor';

// Helper to create 800ms of silence (Base64 PCM) for The Clean Break Protocol
const SILENCE_BURST_B64 = (() => {
    const len = 12800 * 2; 
    const buffer = new Uint8Array(len); // Zeros
    let binary = '';
    for (let i = 0; i < len; i++) { binary += String.fromCharCode(buffer[i]); }
    return btoa(binary);
})();

const MAX_BUFFER_PACKETS = 600;

export function useGeminiLive() {
  const [history, setHistory] = useState<TranscriptItem[]>([]);
  const [activeTranscript, setActiveTranscript] = useState<TranscriptItem | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  
  // NEW: Jitter Simulation State
  const [isJitterEnabled, setIsJitterEnabled] = useState(false);
  
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
      ghostActive: false
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
  
  // Response Locking
  const responseGroupIdRef = useRef<number | null>(null);

  const currentTranscriptIdRef = useRef<string | null>(null);
  const sentPhrasesCountRef = useRef<number>(0);
  const receivedPhrasesCountRef = useRef<number>(0);
  const lastSpeechTimeRef = useRef<number>(0);
  const isHandshakingRef = useRef<boolean>(false);
  
  const connectingBufferRef = useRef<string[]>([]);
  const shieldBufferRef = useRef<string[]>([]);
  const bufferWarningShownRef = useRef<boolean>(false);
  const pendingEndTurnRef = useRef<boolean>(false);
  const lastResponseTimeRef = useRef<number>(Date.now());
  const lastFramesCheckRef = useRef<number>(0);

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
      return activeTranscript ? [...history, activeTranscript] : history;
  }, [history, activeTranscript]);

  // --- AUDIO HANDLING ---
  const handleAudioData = useCallback((base64Data: string) => {
      trackStreamPacket();
      lastResponseTimeRef.current = Date.now(); 
      
      // JITTER SIMULATOR LOGIC
      if (isJitterEnabled) {
          const delay = Math.random() * 200; // 0-200ms random delay
          setTimeout(() => {
              pushPCM(base64Data);
          }, delay);
      } else {
          pushPCM(base64Data);
      }

  }, [pushPCM, trackStreamPacket, isJitterEnabled]);

  const handleTextData = useCallback((text: string) => {
      lastResponseTimeRef.current = Date.now(); 
      if (responseGroupIdRef.current === null) {
          responseGroupIdRef.current = phraseCounterRef.current;
      }
      const lockedId = responseGroupIdRef.current;

      setActiveTranscript(prev => {
           let id = currentTranscriptIdRef.current;
           if (!id) {
               id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
               currentTranscriptIdRef.current = id;
               return { id: id, groupId: lockedId, role: 'model', text: text, timestamp: new Date() };
           }
           if (prev && prev.id === id) {
               let separator = '';
               if (prev.text.length > 0 && text.length > 0) {
                   const lastChar = prev.text.slice(-1);
                   const firstChar = text.charAt(0);
                   if (lastChar !== ' ' && firstChar !== ' ') {
                       const isPunctuation = /^[.,!?;:'")\]]/.test(text);
                       if (!isPunctuation) separator = ' ';
                   }
               }
               return { ...prev, text: prev.text + separator + text };
           }
           return { id: id, groupId: lockedId, role: 'model', text: text, timestamp: new Date() };
      });
  }, []);

  const handleTurnComplete = useCallback(() => {
      lastResponseTimeRef.current = Date.now(); 
      if (confirmOldestTurn()) {
           receivedPhrasesCountRef.current += 1;
           trackTurnComplete();
      }
      setActiveTranscript(current => {
          if (current) {
              setHistory(h => {
                  if (h.some(item => item.id === current.id)) return h;
                  return [...h, current];
              });
          }
          return null; 
      });
      currentTranscriptIdRef.current = null;
      responseGroupIdRef.current = null; 
  }, [confirmOldestTurn, trackTurnComplete]);

  // Mirrors
  const targetLanguagesRef = useRef(config.targetLanguages);
  const customInstRef = useRef(config.customSystemInstruction);
  useEffect(() => { targetLanguagesRef.current = config.targetLanguages; }, [config.targetLanguages]);
  useEffect(() => { customInstRef.current = config.customSystemInstruction; }, [config.customSystemInstruction]);

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

  const { status, connect: sessionConnect, disconnect: sessionDisconnect, sendAudio, sendEndTurn, setStandby } = useGeminiSession({
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
  }, [status]);

  const flushShieldBufferFn = useCallback(() => {
      if (shieldBufferRef.current.length > 0) {
          const burstSize = shieldBufferRef.current.length;
          shieldBufferRef.current.forEach(chunk => sendAudio(chunk));
          shieldBufferRef.current = [];
      }
  }, [sendAudio]);

  const handleStreamingAudio = useCallback((base64Audio: string) => {
      const now = Date.now();
      const isShieldActive = now < busyUntilRef.current;

      if (status === ExtendedStatus.CONNECTED) {
          if (audioDiagnosticsRef.current) {
              audioDiagnosticsRef.current.networkEvent = 'normal';
              setTimeout(() => {
                  if (audioDiagnosticsRef.current && audioDiagnosticsRef.current.networkEvent === 'normal') {
                      audioDiagnosticsRef.current.networkEvent = 'idle';
                  }
              }, 100);
          }

          if (isShieldActive) {
              shieldBufferRef.current.push(base64Audio);
          } else {
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
                  setNotification("Buffert full (>60s). Tömmer gammalt ljud...");
                  bufferWarningShownRef.current = true;
                  setTimeout(() => { bufferWarningShownRef.current = false; }, 10000);
              }
          }
      }
  }, [status, sendAudio, busyUntilRef, flushShieldBufferFn]);

  useEffect(() => {
      const shieldInterval = setInterval(() => {
          if (shieldBufferRef.current.length > 0 && status === ExtendedStatus.CONNECTED) {
              const now = Date.now();
              if (now >= busyUntilRef.current) {
                  flushShieldBufferFn();
              }
          }
      }, 100); 
      return () => clearInterval(shieldInterval);
  }, [status, busyUntilRef, flushShieldBufferFn]);

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

      if (status === ExtendedStatus.CONNECTED) {
          flushShieldBufferFn();
          sendAudio(SILENCE_BURST_B64);
          setTimeout(() => {
              sendEndTurn();
          }, 50);
      } else {
          pendingEndTurnRef.current = true;
      }

  }, [status, enqueueTurn, markTurnAsSent, queueLength, trackSentTurn, config.activeMode, sendEndTurn, flushShieldBufferFn, sendAudio]); 

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
      shieldBufferRef 
  });

  const disconnect = useCallback(() => {
      sessionDisconnect();
      stopAudioInput(); 
      // Removed resetPlayer() since AudioEngine doesn't need explicit reset
      resetDiagnostics();
      resetQueue(); 
      shieldBufferRef.current = []; 
      currentTranscriptIdRef.current = null;
      responseGroupIdRef.current = null; 
      sentPhrasesCountRef.current = 0;
      receivedPhrasesCountRef.current = 0;
      phraseCounterRef.current = 0; 
      connectingBufferRef.current = [];
      pendingEndTurnRef.current = false;
      isHandshakingRef.current = false;
      setHistory([]);
      setActiveTranscript(null);
  }, [sessionDisconnect, resetDiagnostics, stopAudioInput, resetQueue]); 

  const connect = useCallback(async (isWakeup = false) => {
      if (isHandshakingRef.current) return;
      isHandshakingRef.current = true;

      const apiKey = process.env.API_KEY;
      const sysInstruct = customInstRef.current || buildSystemInstruction(targetLanguagesRef.current);

      if (isWakeup) setNotification("Vaknar..."); else setNotification("Startar...");

      if (status === ExtendedStatus.CONNECTED) {
          isHandshakingRef.current = false;
          return;
      }

      sessionDisconnect();
      await new Promise(r => setTimeout(r, 200));

      try {
          // --- INIT NEW AUDIO ENGINE ---
          await initAudioEngine();
          
          if (!inputContextRef.current || inputContextRef.current.state === 'closed') {
              await initAudioInput(true); 
          } else if (inputContextRef.current.state === 'suspended') {
              await inputContextRef.current.resume();
          }

          await sessionConnect({ apiKey, systemInstruction: sysInstruct, voiceName: 'Puck' });
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

          d.shieldActive = now < busyUntilRef.current;
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

          // --- POLL AUDIO ENGINE STATUS ---
          // This updates the 'bufferSize' metric in the diagnostics with real engine data
          if (getBufferStatus) {
              const engineStatus = getBufferStatus();
              d.bufferGap = engineStatus.ms / 1000; // Convert to seconds
              d.outQueue = engineStatus.samples; // Raw samples
          }

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
      latestRtt, config.coldStartSamples
  ]);

  return {
    status, transcripts, error, queueStats, 
    currentPlaybackRate: 1.0, // Managed internally by worklet now
    paceStatus: 'Managed by Worklet', 
    currentLatency, packetEvents, notification, effectiveMinDuration,
    activePhraseTiming: null, // Legacy timing not used with direct engine yet
    setMode, audioDiagnosticsRef, 
    triggerTestTone, injectTextAsAudio, initAudioInput, connect, disconnect,
    simulateNetworkDrop,
    audioContext, 
    // EXPOSE ENGINE TOOLS
    getBufferStatus,
    isJitterEnabled, setIsJitterEnabled,
    ...config 
  };
}
