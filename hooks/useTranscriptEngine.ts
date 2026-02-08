
import { useState, useRef, useCallback } from 'react';
import { TranscriptItem } from '../types';

export function useTranscriptEngine() {
    const [history, setHistory] = useState<TranscriptItem[]>([]);
    const [activeTranscript, setActiveTranscript] = useState<TranscriptItem | null>(null);
    
    // Internal refs to track IDs
    const currentTranscriptIdRef = useRef<string | null>(null);
    const responseGroupIdRef = useRef<number | null>(null);

    const addTextFragment = useCallback((text: string, currentPhraseId: number) => {
        // Lock response to the phrase ID active when response started
        if (responseGroupIdRef.current === null) {
            responseGroupIdRef.current = currentPhraseId;
        }
        const lockedId = responseGroupIdRef.current;

        setActiveTranscript(prev => {
             let id = currentTranscriptIdRef.current;
             
             // Initialize new active transcript if none exists
             if (!id) {
                 id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
                 currentTranscriptIdRef.current = id;
                 return { 
                     id: id, 
                     groupId: lockedId, 
                     role: 'model', 
                     text: text, 
                     timestamp: new Date() 
                 };
             }

             // Append to existing
             if (prev && prev.id === id) {
                 let separator = '';
                 // Smart spacing logic
                 if (prev.text.length > 0 && text.length > 0) {
                     const lastChar = prev.text.slice(-1);
                     const firstChar = text.charAt(0);
                     // Don't add space if we are appending punctuation
                     if (lastChar !== ' ' && firstChar !== ' ') {
                         const isPunctuation = /^[.,!?;:'")\]]/.test(text);
                         if (!isPunctuation) separator = ' ';
                     }
                 }
                 return { ...prev, text: prev.text + separator + text };
             }
             
             // Fallback (should normally not happen inside same ID)
             return { id: id, groupId: lockedId, role: 'model', text: text, timestamp: new Date() };
        });
    }, []);

    const finalizeTurn = useCallback(() => {
        setActiveTranscript(current => {
            if (current) {
                setHistory(h => {
                    // Prevent duplicates
                    if (h.some(item => item.id === current.id)) return h;
                    return [...h, current];
                });
            }
            return null; // Clear active
        });
        
        // Reset ID trackers
        currentTranscriptIdRef.current = null;
        responseGroupIdRef.current = null; 
    }, []);

    const resetTranscripts = useCallback(() => {
        setHistory([]);
        setActiveTranscript(null);
        currentTranscriptIdRef.current = null;
        responseGroupIdRef.current = null;
    }, []);

    return {
        history,
        activeTranscript,
        addTextFragment,
        finalizeTurn,
        resetTranscripts
    };
}
