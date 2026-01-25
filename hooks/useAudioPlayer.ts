
import { useState, useRef, useEffect, useCallback } from 'react';
import { decodeBase64, decodeAudioData } from '../utils/audioUtils';
import { PhraseTiming } from '../types';

interface AudioQueueItem {
    id: string; 
    buffer: AudioBuffer;
    groupId: number; 
    duration: number;
    scheduledTime: number; 
}

interface UseAudioPlayerProps {
    sampleRate?: number;
    outputDeviceId?: string; 
}

export function useAudioPlayer({ sampleRate = 24000, outputDeviceId }: UseAudioPlayerProps = {}) {
    const [isPlaying, setIsPlaying] = useState(false);
    
    const [activePhraseTiming, setActivePhraseTiming] = useState<PhraseTiming | null>(null);

    const [bufferGap, setBufferGap] = useState(0);
    const [currentPlaybackRate, setCurrentPlaybackRate] = useState(1.0);
    const [throttledQueueLength, setThrottledQueueLength] = useState(0);

    const audioContextRef = useRef<AudioContext | null>(null);
    const nextPlayTimeRef = useRef<number>(0);
    const queueRef = useRef<AudioQueueItem[]>([]);
    
    // Tracking active playback
    const currentlyPlayingRef = useRef<{ groupId: number; endTime: number } | null>(null);
    
    // START TIME ANCHOR: Keeps track of the original start time of the current phrase group
    const currentGroupAnchorRef = useRef<{ groupId: number; startTime: number; totalDuration: number } | null>(null);

    // Dynamic Rate Ref (smoothed)
    const targetPlaybackRateRef = useRef(1.0);
    
    const animationFrameRef = useRef<number | null>(null);
    const lastUiUpdateRef = useRef<number>(0);

    // CONFIGURATION
    const TARGET_BUFFER_SEC = 0.25; // Ideal low latency buffer
    const CATCHUP_THRESHOLD = 0.4;  // Start speeding up if buffer > 0.4s
    const MAX_SAFE_RATE = 1.12;     // Cap at 1.12x to prevent "Smurf/Chipmunk" effect (Pitch shift artifact)
    const LOOKAHEAD_MS = 0.05; 

    const applySinkId = useCallback(async (ctx: AudioContext, deviceId?: string) => {
        if (!deviceId || deviceId === 'default') return;
        if ('setSinkId' in ctx && typeof (ctx as any).setSinkId === 'function') {
            try {
                await (ctx as any).setSinkId(deviceId);
            } catch (error) {
                console.warn("[AudioPlayer] Failed to set output device:", error);
            }
        }
    }, []);

    const initContext = useCallback(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate });
            if (outputDeviceId) {
                applySinkId(audioContextRef.current, outputDeviceId);
            }
        }
    }, [sampleRate, outputDeviceId, applySinkId]);

    useEffect(() => {
        if (audioContextRef.current && outputDeviceId) {
            applySinkId(audioContextRef.current, outputDeviceId);
        }
    }, [outputDeviceId, applySinkId]);

    const resumeContext = useCallback(async () => {
        initContext();
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
            try {
                await audioContextRef.current.resume();
            } catch (err) {
                console.warn("[AudioPlayer] Failed to resume context:", err);
            }
        }
    }, [initContext]);

    useEffect(() => {
        return () => {
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close().catch(() => {});
            }
        };
    }, []);

    // --- THE ELASTIC CATCH-UP ENGINE ---
    const calculateOptimalRate = (queuedDuration: number) => {
        if (queuedDuration <= CATCHUP_THRESHOLD) return 1.0;

        // Linear Ramp:
        // 0.4s -> 1.0x
        // 2.0s -> 1.12x
        const progress = Math.min(1, (queuedDuration - CATCHUP_THRESHOLD) / 1.6);
        const boost = progress * (MAX_SAFE_RATE - 1.0);
        
        return 1.0 + boost;
    };

    const processQueue = useCallback(() => {
        if (audioContextRef.current) {
            const ctx = audioContextRef.current;
            const now = ctx.currentTime;

            // 1. CLEANUP
            if (currentlyPlayingRef.current && now > currentlyPlayingRef.current.endTime) {
                currentlyPlayingRef.current = null;
                if (queueRef.current.length === 0) {
                     setActivePhraseTiming(null);
                     setIsPlaying(false);
                }
            }

            // 2. BUFFER METRICS & DYNAMIC RATE CALCULATION
            // How much audio is physically scheduled or waiting in queue?
            const queuedDurationSec = Math.max(0, nextPlayTimeRef.current - now);
            
            // Calculate optimal rate for the NEXT chunk
            const optimalRate = calculateOptimalRate(queuedDurationSec);
            
            // Apply smoothing (simple hysteresis) to prevent jittery rate changes
            // We move 10% towards the target per frame
            targetPlaybackRateRef.current += (optimalRate - targetPlaybackRateRef.current) * 0.1;
            
            // Clamp for safety (floating point errors)
            if (targetPlaybackRateRef.current < 1.0) targetPlaybackRateRef.current = 1.0;
            if (targetPlaybackRateRef.current > MAX_SAFE_RATE) targetPlaybackRateRef.current = MAX_SAFE_RATE;

            // 3. UI UPDATES (Throttled)
            const sysNow = Date.now();
            if (sysNow - lastUiUpdateRef.current > 200) { 
                 setBufferGap(queuedDurationSec - TARGET_BUFFER_SEC);
                 setCurrentPlaybackRate(Number(targetPlaybackRateRef.current.toFixed(2)));
                 setThrottledQueueLength(queueRef.current.length); 
                 lastUiUpdateRef.current = sysNow;
            }

            // 4. SCHEDULING
            if (queueRef.current.length > 0) {
                const strictStartTime = nextPlayTimeRef.current;
                
                // Timeline Clamping: Prevent scheduling in the past
                const actualStartTime = Math.max(strictStartTime, now + LOOKAHEAD_MS);

                const isReadyToPlay = (actualStartTime - now) < 0.1;
                const isBufferHealthy = (strictStartTime - now) < 0.5;

                if (isReadyToPlay || isBufferHealthy) {
                    const item = queueRef.current.shift(); 
                    if (item) {
                        const source = ctx.createBufferSource();
                        source.buffer = item.buffer;
                        
                        // APPLY DYNAMIC RATE
                        const rate = targetPlaybackRateRef.current;
                        source.playbackRate.value = rate;
                        
                        source.connect(ctx.destination);
                        source.start(actualStartTime);
                        
                        // CRITICAL: Calculate effective duration based on speed
                        // If we play faster (rate > 1), the chunk takes LESS time.
                        const effectiveDuration = item.duration / rate;
                        
                        nextPlayTimeRef.current = actualStartTime + effectiveDuration;

                        currentlyPlayingRef.current = {
                            groupId: item.groupId,
                            endTime: nextPlayTimeRef.current
                        };
                        
                        // --- ANCHOR LOGIC ---
                        let uiStartTime = actualStartTime;
                        let uiTotalDuration = effectiveDuration;

                        const anchor = currentGroupAnchorRef.current;
                        
                        const isContiguous = anchor && 
                                             anchor.groupId === item.groupId &&
                                             (actualStartTime - (anchor.startTime + anchor.totalDuration)) < 0.5;

                        if (isContiguous && anchor) {
                            uiStartTime = anchor.startTime;
                            anchor.totalDuration += effectiveDuration;
                            uiTotalDuration = anchor.totalDuration;
                        } else {
                            currentGroupAnchorRef.current = {
                                groupId: item.groupId,
                                startTime: actualStartTime,
                                totalDuration: effectiveDuration
                            };
                            uiStartTime = actualStartTime;
                            uiTotalDuration = effectiveDuration;
                        }

                        setActivePhraseTiming({
                            groupId: item.groupId,
                            startTime: uiStartTime,
                            duration: uiTotalDuration
                        });
                        
                        setIsPlaying(true);
                    }
                }
            }
        }

        animationFrameRef.current = requestAnimationFrame(processQueue);
    }, []);

    useEffect(() => {
        animationFrameRef.current = requestAnimationFrame(processQueue);
        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [processQueue]);

    const addToQueue = useCallback(async (base64Data: string, groupId: number) => {
        initContext();
        if (audioContextRef.current?.state === 'suspended') {
             audioContextRef.current.resume().catch(() => {});
        }

        if (!audioContextRef.current) return;

        try {
            const pcmData = decodeBase64(base64Data);
            const audioBuffer = await decodeAudioData(pcmData, audioContextRef.current, sampleRate, 1);
            
            const item: AudioQueueItem = {
                id: Date.now().toString() + Math.random().toString(),
                buffer: audioBuffer,
                groupId: groupId,
                duration: audioBuffer.duration,
                scheduledTime: 0 
            };
            
            queueRef.current.push(item);
        } catch (e) {
            console.error("Audio Decode Error:", e);
        }
    }, [initContext, sampleRate]);

    const resetPlayer = useCallback(() => {
        if (audioContextRef.current) {
            queueRef.current = [];
            nextPlayTimeRef.current = 0;
            currentlyPlayingRef.current = null;
            currentGroupAnchorRef.current = null;
            setActivePhraseTiming(null);
            setIsPlaying(false);
            setThrottledQueueLength(0);
            targetPlaybackRateRef.current = 1.0;
        }
    }, []);

    return {
        addToQueue,
        resetPlayer,
        resumeContext, 
        isPlaying,
        activePhraseTiming, 
        bufferGap,
        currentPlaybackRate,
        queueLength: throttledQueueLength,
        audioContext: audioContextRef.current
    };
}
