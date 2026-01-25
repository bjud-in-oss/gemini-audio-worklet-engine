
import { useRef, useState, useCallback, useEffect } from 'react';
import * as GenAIModule from '@google/genai';
import { ConnectionStatus } from '../types';

// Robust import handling
const GoogleGenAI = GenAIModule.GoogleGenAI || (GenAIModule as any).default?.GoogleGenAI;
const Modality = GenAIModule.Modality || (GenAIModule as any).default?.Modality || { AUDIO: 'AUDIO' };

export const ExtendedStatus = {
    ...ConnectionStatus,
    STANDBY: 'standby'
} as const;

export type ExtendedStatusType = typeof ExtendedStatus[keyof typeof ExtendedStatus];

interface SessionConfig {
    apiKey?: string;
    systemInstruction: string;
    voiceName?: string;
}

interface SessionCallbacks {
    onAudioData: (data: string) => void;
    onTextData: (text: string) => void;
    onTurnComplete: () => void;
    onError: (error: string) => void;
    onConnect: () => void;
    onDisconnect: () => void;
    onMessageReceived?: () => void;
}

export function useGeminiSession(callbacks: SessionCallbacks) {
    const [status, setStatus] = useState<ExtendedStatusType>(ExtendedStatus.DISCONNECTED);
    const sessionRef = useRef<any | null>(null);
    const retryTimeoutRef = useRef<any>(null);
    const retryCountRef = useRef<number>(0); // Track retries for backoff
    const activeRef = useRef(false);
    
    // NEW: Track the ID of the current connection attempt to ignore stale events
    const connectionIdRef = useRef<number>(0);

    const connect = useCallback(async (config: SessionConfig, isRetry = false) => {
        // TRUTH CHECK: API Key
        if (!config.apiKey || config.apiKey.length < 10) {
            console.error("[Session] ❌ CRITICAL: API_KEY appears invalid or missing.");
            callbacks.onError("API_KEY saknas eller är ogiltig");
            return;
        }
        
        // Reset retry count if this is a fresh connection attempt by the user
        if (!isRetry) {
            retryCountRef.current = 0;
        }
        
        // ZOMBIE CLEANUP: Always ensure previous session is dead before starting new
        if (sessionRef.current) {
            console.log("[Session] Cleaning up existing session before reconnect...");
            try { await sessionRef.current.close(); } catch(e) {}
            sessionRef.current = null;
        }

        // GENERATE TICKET ID
        const myConnectionId = Date.now();
        connectionIdRef.current = myConnectionId;

        setStatus(ExtendedStatus.CONNECTING);
        activeRef.current = true;

        try {
            const ai = new GoogleGenAI({ apiKey: config.apiKey });
            
            const sessionConfig = {
                model: 'gemini-2.5-flash-native-audio-preview-12-2025',
                config: {
                  responseModalities: [Modality.AUDIO], 
                  speechConfig: { 
                      voiceConfig: { prebuiltVoiceConfig: { voiceName: config.voiceName || 'Puck' } } 
                  },
                  outputAudioTranscription: {}, 
                  systemInstruction: config.systemInstruction
                },
            };

            const sessionPromise = ai.live.connect({
                ...sessionConfig,
                callbacks: {
                    onopen: () => {
                        // IGNORE IF STALE
                        if (connectionIdRef.current !== myConnectionId) return;

                        console.log(`[Session ${myConnectionId}] ✅ Socket Connected`);
                        setStatus(ExtendedStatus.CONNECTED);
                        retryCountRef.current = 0; // Reset retries on successful connection
                        // NOTE: We do NOT call onConnect here anymore. 
                        // We wait until sessionRef is assigned below to prevent "flush into void".
                    },
                    onmessage: async (message: any) => {
                        if (connectionIdRef.current !== myConnectionId) return;
                        
                        if (callbacks.onMessageReceived) callbacks.onMessageReceived();

                        const serverContent = message.serverContent;
                        
                        // 1. Handle Audio
                        if (serverContent?.modelTurn?.parts) {
                            for (const part of serverContent.modelTurn.parts) {
                                if (part.inlineData?.data) {
                                    callbacks.onAudioData(part.inlineData.data);
                                }
                            }
                        }

                        // 2. Handle Text (Subtitles)
                        if (serverContent?.outputTranscription?.text) {
                            callbacks.onTextData(serverContent.outputTranscription.text);
                        }
                        
                        // 3. Handle Turn Complete
                        if (serverContent?.turnComplete) {
                            callbacks.onTurnComplete();
                        }
                    },
                    onclose: (e) => {
                        // CRITICAL FIX: Only react if this is the CURRENT session closing
                        if (connectionIdRef.current !== myConnectionId) {
                            console.log(`[Session ${myConnectionId}] 👻 Stale session closed. Ignoring.`);
                            return;
                        }

                        console.log(`[Session ${myConnectionId}] 🔌 Socket Closed`, e);
                        
                        // FAIL-SAFE: If connection dies, assume turn is complete to DROP THE SHIELD
                        callbacks.onTurnComplete(); 

                        if (activeRef.current && status !== ExtendedStatus.STANDBY) {
                            setStatus(ExtendedStatus.DISCONNECTED);
                            callbacks.onDisconnect();
                        }
                    },
                    onerror: (e: any) => {
                        if (connectionIdRef.current !== myConnectionId) return;

                        const msg = e.message || String(e);
                        console.error(`[Session ${myConnectionId}] ❌ Error:`, msg);
                        
                        // FAIL-SAFE: Error means streaming stopped. Drop shield.
                        callbacks.onTurnComplete();

                        // Treat "Operation is not implemented" as a fatal error instead of ignoring it
                        if (msg.includes("Operation is not implemented") || msg.includes("not supported")) {
                            setStatus(ExtendedStatus.ERROR);
                            callbacks.onError("Modellfel: Funktionen stöds ej. (Not Implemented)");
                            return; 
                        }

                        // Robust Retry Logic (Exponential Backoff)
                        if (
                            msg.includes("unavailable") || 
                            msg.includes("503") || 
                            msg.includes("Internal error") ||
                            msg.includes("Network error") ||
                            msg.includes("aborted") || 
                            msg.includes("Failed to fetch") || 
                            msg.includes("capacity") ||
                            msg.includes("429")
                        ) {
                             const backoffDelay = Math.min(1000 * Math.pow(1.5, retryCountRef.current), 15000);
                             retryCountRef.current += 1;

                             console.warn(`[Session] Transient error (${msg}), retrying in ${backoffDelay}ms... (Attempt ${retryCountRef.current})`);
                             
                             if (activeRef.current) {
                                 try { sessionRef.current?.close(); } catch(err) {}
                                 sessionRef.current = null;
                                 retryTimeoutRef.current = setTimeout(() => connect(config, true), backoffDelay);
                             }
                             return;
                        }
                        
                        setStatus(ExtendedStatus.ERROR);
                        callbacks.onError("Anslutningsfel: " + msg);
                    }
                }
            });

            const session = await sessionPromise;
            
            // Assign session only if we haven't started a NEW connection in the meantime
            if (connectionIdRef.current === myConnectionId) {
                sessionRef.current = session;
                // CRITICAL FIX: Signal Ready ONLY after session is assigned.
                // This ensures 'sendAudio' will work immediately when the consumer reacts to onConnect.
                console.log(`[Session ${myConnectionId}] 🚀 Session Assigned & Ready. Triggering onConnect.`);
                callbacks.onConnect();
            } else {
                // If we are stale immediately after creation, close it
                try { session.close(); } catch(e) {}
            }

        } catch (e: any) {
            if (connectionIdRef.current !== myConnectionId) return;

            console.error("[Session] Connection Failed immediately", e);
            
            // Check for network error on immediate failure too
            const msg = e.message || String(e);
            
            // Immediate retry for specific startup errors
            if (activeRef.current && (
                msg.includes("Network error") || 
                msg.includes("Failed to fetch") ||
                msg.includes("aborted") ||
                msg.includes("unavailable")
            )) {
                const backoffDelay = Math.min(1000 * Math.pow(1.5, retryCountRef.current), 10000);
                retryCountRef.current += 1;
                console.warn(`[Session] Immediate error, retrying in ${backoffDelay}ms...`, msg);
                retryTimeoutRef.current = setTimeout(() => connect(config, true), backoffDelay);
                return;
            }

            setStatus(ExtendedStatus.DISCONNECTED);
            callbacks.onError(e.message);
        }
    }, [status, callbacks]);

    const disconnect = useCallback(() => {
        // Invalidate current ID so no more callbacks fire
        connectionIdRef.current = 0; 
        retryCountRef.current = 0;
        
        activeRef.current = false;
        if (sessionRef.current) {
            try { sessionRef.current.close(); } catch(e) {}
            sessionRef.current = null;
        }
        if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
        setStatus(ExtendedStatus.DISCONNECTED);
        callbacks.onDisconnect();
    }, [callbacks]);

    const sendAudio = useCallback((base64Audio: string) => {
        // RACE CONDITION FIX: Do not check 'status' here. 
        // During rapid connects, status might still be CONNECTING in the closure (React state lag), 
        // but sessionRef.current is valid and connected. Trust the ref.
        if (sessionRef.current) {
            try {
                const size = base64Audio.length;
                if (size > 10000 && (window as any).APP_LOGS_ENABLED) {
                     console.log(`%c[Network] 🚀 FLUSHING BUFFER: ${size} bytes sent`, 'color: orange; font-weight: bold;');
                } 

                sessionRef.current.sendRealtimeInput({ 
                    media: { 
                        mimeType: 'audio/pcm;rate=16000', 
                        data: base64Audio 
                    } 
                });
                return true;
            } catch (e) {
                console.error("[Session] Send Failed", e);
                return false;
            }
        }
        return false;
    }, []);

    // NEW: Explicitly signal end of turn to force a response
    const sendEndTurn = useCallback(() => {
        // RACE CONDITION FIX: Trust sessionRef over status state
        if (sessionRef.current) {
            try {
                // We access the underlying send method to dispatch a control message
                // This forces the server VAD to consider the user 'done'
                if (typeof sessionRef.current.send === 'function') {
                    sessionRef.current.send({ clientContent: { turnComplete: true } });
                    if ((window as any).APP_LOGS_ENABLED) {
                        console.log("%c[Network] 🛑 SENT END_OF_TURN SIGNAL", "color: red; font-weight: bold;");
                    }
                }
            } catch (e) {
                console.warn("[Session] Failed to send EndTurn signal", e);
            }
        }
    }, []);

    const setStandby = useCallback(() => {
        if (sessionRef.current) {
            try { sessionRef.current.close(); } catch(e) {}
            sessionRef.current = null;
        }
        setStatus(ExtendedStatus.STANDBY);
    }, []);

    return {
        status,
        connect,
        disconnect,
        sendAudio,
        sendEndTurn, // Exported
        setStandby,
        isActive: activeRef.current
    };
}
