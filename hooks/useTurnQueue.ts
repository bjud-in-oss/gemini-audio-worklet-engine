
import { useState, useRef, useCallback } from 'react';
import { TurnPackage } from '../types';

export function useTurnQueue() {
    const pendingQueueRef = useRef<TurnPackage[]>([]);
    const inFlightIdsRef = useRef<Set<string>>(new Set());
    const [queueLength, setQueueLength] = useState(0);

    const enqueueTurn = useCallback((turn: TurnPackage) => {
        pendingQueueRef.current.push(turn);
        setQueueLength(pendingQueueRef.current.length);
    }, []);

    const flushQueue = useCallback((): TurnPackage[] => {
        if (pendingQueueRef.current.length === 0) return [];
        const items = [...pendingQueueRef.current];
        pendingQueueRef.current = [];
        setQueueLength(0);
        items.forEach(item => inFlightIdsRef.current.add(item.id));
        return items;
    }, []);

    const markTurnAsSent = useCallback((id: string) => {
        inFlightIdsRef.current.add(id);
    }, []);

    const confirmTurnComplete = useCallback((id: string) => {
        if (inFlightIdsRef.current.has(id)) {
            inFlightIdsRef.current.delete(id);
            return true;
        }
        return false;
    }, []);

    const confirmOldestTurn = useCallback(() => {
        if (inFlightIdsRef.current.size > 0) {
            const oldestId = inFlightIdsRef.current.values().next().value;
            if (oldestId) {
                inFlightIdsRef.current.delete(oldestId);
                return true;
            }
        }
        return false;
    }, []);

    // NEW: Force Reset to fix stuck logs
    const resetQueue = useCallback(() => {
        pendingQueueRef.current = [];
        inFlightIdsRef.current.clear();
        setQueueLength(0);
        if ((window as any).APP_LOGS_ENABLED) {
            console.log("[Queue] HARD RESET performed.");
        }
    }, []);

    const isPendingWork = useCallback(() => {
        return inFlightIdsRef.current.size > 0 || pendingQueueRef.current.length > 0;
    }, []);

    return {
        enqueueTurn,
        flushQueue,
        markTurnAsSent,
        confirmTurnComplete,
        confirmOldestTurn,
        resetQueue, // Exported
        isPendingWork,
        queueLength,
        inFlightCount: inFlightIdsRef.current.size
    };
}
