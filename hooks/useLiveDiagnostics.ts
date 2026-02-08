
import { useState, useRef, useCallback } from 'react';
import { QueueStats } from '../types';
import { DataPoint, PredictionModel, SAFE_MODE_MODEL } from '../utils/adaptiveLogic';

const MAX_VALID_TURN_DURATION = 10000;
const GHOST_TURN_TIMEOUT = 5000;

interface TurnTiming {
    sentAt: number;
    duration: number;
}

interface PacketEvents {
    sending: boolean;
    receiving: boolean;
}

export function useLiveDiagnostics() {
    // --- STATE ---
    const [packetEvents, setPacketEvents] = useState<PacketEvents>({ sending: false, receiving: false });
    const [queueStats, setQueueStats] = useState<QueueStats>({ 
        isBuffering: false, lastBufferDuration: 0, processing: 0, outQueue: 0, 
        efficiencyRatio: 100, confirmedHandshakes: 0, bufferGap: 0,
        modelDiagnostics: { processingRate: 0, fixedOverhead: 4000, safetyMargin: 2000, confidence: 1 } 
    });

    // --- REFS ---
    const busyUntilRef = useRef<number>(0); 
    const lastBufferDurationRef = useRef<number>(0);
    
    // ZOMBIE PROTECTION: If true, ignore incoming packets for shield logic until user speaks again
    const isAiTurnCompleteRef = useRef<boolean>(false);

    const turnTimingsRef = useRef<Map<string, TurnTiming>>(new Map());
    const sentTurnOrderRef = useRef<string[]>([]);
    const completionHistoryRef = useRef<DataPoint[]>([]); 
    const predictionModelRef = useRef<PredictionModel>(SAFE_MODE_MODEL); 
    const latestRttRef = useRef<number>(0); 
    const lastPacketTimeRef = useRef<number>(0); 
    const coldStartLimitRef = useRef<number>(5);

    const setColdStartLimit = useCallback((limit: number) => {
        coldStartLimitRef.current = limit;
    }, []);

    // 1. USER SPEAKS (Input)
    const trackSentTurn = useCallback((turnId: string, durationMs: number) => {
        setPacketEvents(prev => ({ ...prev, sending: !prev.sending }));
        lastBufferDurationRef.current = durationMs;
        
        // RESET ZOMBIE PROTECTION: User started a new turn, so we are ready to listen again
        isAiTurnCompleteRef.current = false;

        const now = Date.now();

        // Garbage Collection
        if (sentTurnOrderRef.current.length > 0) {
            const oldestId = sentTurnOrderRef.current[0];
            const oldestData = turnTimingsRef.current.get(oldestId);
            if (oldestData && (now - oldestData.sentAt > GHOST_TURN_TIMEOUT)) {
                sentTurnOrderRef.current.shift();
                turnTimingsRef.current.delete(oldestId);
            }
        }

        turnTimingsRef.current.set(turnId, { sentAt: now, duration: durationMs });
        sentTurnOrderRef.current.push(turnId);

        // SAFETY SHIELD: Increased from 1500 to 4000 to prevent barge-in during cold starts
        const fixedThinkingMargin = 4000; 
        busyUntilRef.current = now + fixedThinkingMargin;
    }, []);

    // 2. AI SPEAKS (Output Stream)
    const trackStreamPacket = useCallback(() => {
        const now = Date.now();
        lastPacketTimeRef.current = now;
        
        // ZOMBIE CHECK: If the AI already said "I'm done", ignore trailing audio packets regarding the shield
        if (isAiTurnCompleteRef.current) return;
        
        // Reduced rolling margin to make shield snappier (from 2000ms to 600ms)
        const rollingSafetyMargin = 600;
        busyUntilRef.current = now + rollingSafetyMargin;
    }, []);

    // 3. TURN COMPLETE (Signal)
    // MODIFIED FOR BUG 40: Now accepts 'shouldDropShield'
    const trackTurnComplete = useCallback((shouldDropShield: boolean = true) => {
        // Only drop shield if the caller (GeminiLive hook) says the buffer is empty
        if (shouldDropShield) {
            busyUntilRef.current = 0; 
        } else {
            // If buffer is full, we keep the shield alive.
            // The Hydraulic Latch in useGeminiLive will manage it from here.
            if ((window as any).APP_LOGS_ENABLED) {
                console.log("[Diagnostics] TurnComplete received, but Shield kept UP due to Buffer Pressure.");
            }
        }
        
        // ACTIVATE ZOMBIE PROTECTION: Prevent late packets from raising the shield again
        isAiTurnCompleteRef.current = true;
        
        const now = Date.now();
        if (sentTurnOrderRef.current.length > 0) {
            const oldestId = sentTurnOrderRef.current.shift();
            if (oldestId) {
                const turnData = turnTimingsRef.current.get(oldestId);
                if (turnData) {
                    const totalResponseTime = now - turnData.sentAt;
                    if (totalResponseTime < MAX_VALID_TURN_DURATION) {
                        const dp: DataPoint = { inputDuration: turnData.duration, responseDuration: totalResponseTime };
                        completionHistoryRef.current.push(dp);
                        if (completionHistoryRef.current.length > 20) completionHistoryRef.current.shift();
                        latestRttRef.current = totalResponseTime - turnData.duration;
                    }
                    turnTimingsRef.current.delete(oldestId);
                }
            }
        }
    }, []);

    const resetDiagnostics = useCallback(() => {
        busyUntilRef.current = 0;
        isAiTurnCompleteRef.current = false;
        turnTimingsRef.current.clear();
        sentTurnOrderRef.current = [];
        completionHistoryRef.current = [];
        lastBufferDurationRef.current = 0;
        latestRttRef.current = 0;
        predictionModelRef.current = SAFE_MODE_MODEL;
    }, []);

    const updateStats = useCallback((
        sent: number, received: number, queueLen: number, 
        inFlight: number, outQueue: number, bufferGap: number
    ) => {
        setQueueStats(prev => ({
            ...prev,
            isBuffering: inFlight > 0,
            lastBufferDuration: lastBufferDurationRef.current,
            processing: inFlight,
            outQueue: outQueue,
            bufferGap: bufferGap,
            efficiencyRatio: sent > 0 ? Math.round((received / sent) * 100) : 100,
            confirmedHandshakes: received,
            modelDiagnostics: {
                processingRate: 0, 
                fixedOverhead: 4000,
                safetyMargin: 2000, 
                confidence: 1
            }
        }));
    }, []);

    return {
        queueStats,
        packetEvents,
        trackSentTurn,
        trackStreamPacket,
        trackTurnComplete,
        resetDiagnostics,
        updateStats,
        busyUntilRef,
        latestRtt: latestRttRef.current,
        lastRttUpdate: lastPacketTimeRef.current,
        setColdStartLimit, 
        completionHistoryRef,
        predictionModelRef
    };
}
