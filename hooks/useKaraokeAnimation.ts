
import { useEffect, useRef } from 'react';
import { PhraseTiming } from '../types';

interface SentenceBucket {
    words: { word: string; weight: number; globalIndex: number }[];
    totalWeight: number;
    startTimePct: number; // 0.0 to 1.0 (relative start within the block)
    durationPct: number;  // 0.0 to 1.0 (relative width of this bucket)
}

/**
 * useKaraokeAnimation (Sentence Bucket Sync)
 * 
 * STRATEGY: 
 * Instead of treating the whole paragraph as one timeline, we slice it into "Sentence Buckets".
 * Each bucket gets a slice of the total duration based on its weight.
 * This acts as a checkpoint system: If Sentence 1 is slightly off, Sentence 2 forces a reset.
 */
export function useKaraokeAnimation(
    timing: PhraseTiming | null,
    audioContext: AudioContext | null,
    text: string 
) {
    const containerRef = useRef<HTMLDivElement>(null);
    const frameRef = useRef<number | null>(null);
    
    // RATCHET: Keeps track of the furthest word we've reached to prevent flickering back.
    const maxReachedIndexRef = useRef<number>(-1);
    const lastTimingGroupRef = useRef<number>(-1);

    useEffect(() => {
        if (frameRef.current) {
            cancelAnimationFrame(frameRef.current);
        }

        // HANDLE NULL TIMING (LINGER MODE)
        // If timing is null, it means audio has stopped but we still want to show the text.
        // We should mark ALL words as active (completed).
        if (!timing) {
            if (containerRef.current) {
                const spans = containerRef.current.children;
                for (let i = 0; i < spans.length; i++) {
                    spans[i].classList.add('active');
                }
            }
            return;
        }

        // Reset ratchet if we switch to a completely new phrase group
        if (timing && timing.groupId !== lastTimingGroupRef.current) {
            maxReachedIndexRef.current = -1;
            lastTimingGroupRef.current = timing.groupId;
        }

        if (!audioContext || !containerRef.current) {
            return;
        }

        // --- STEP 1: PARSE & BUCKETIZE ---
        // We need to build the map of sentences once per text update.
        const rawWords = text.split(' ');
        const buckets: SentenceBucket[] = [];
        let currentBucket: SentenceBucket = { words: [], totalWeight: 0, startTimePct: 0, durationPct: 0 };
        let grandTotalWeight = 0;

        rawWords.forEach((word, index) => {
            // Calculate Word Weight (Character length + Punctuation Penalty)
            let w = word.length;
            if (word.includes(',')) w += 6;
            else if (word.match(/[.!?]/)) w += 15;
            const weight = Math.max(1, w);

            currentBucket.words.push({ word, weight, globalIndex: index });
            currentBucket.totalWeight += weight;
            grandTotalWeight += weight;

            // Check if sentence ended (End of bucket)
            // A word ending in . ! ? marks a bucket boundary
            // Exception: If it's the very last word, push the bucket anyway
            if (word.match(/[.!?]$/) || index === rawWords.length - 1) {
                // If this word ends a sentence, close the bucket
                if (currentBucket.words.length > 0) {
                     buckets.push(currentBucket);
                     // Start new bucket
                     currentBucket = { words: [], totalWeight: 0, startTimePct: 0, durationPct: 0 };
                }
            }
        });

        // --- STEP 2: ALLOCATE TIME WINDOWS ---
        let runningPct = 0;
        buckets.forEach(bucket => {
            const share = bucket.totalWeight / grandTotalWeight;
            bucket.startTimePct = runningPct;
            bucket.durationPct = share;
            runningPct += share;
        });

        const animate = () => {
            if (!containerRef.current) return;

            const now = audioContext.currentTime;
            
            // Lookahead RESTORED: We add 50ms to be slightly ahead of the audio.
            // This compensates for screen refresh latency and cognitive processing.
            // "Better slightly early than slightly late."
            const elapsed = (now - timing.startTime) + 0.05; 
            
            // --- STEP 3: HYBRID DURATION (Speed Limit) ---
            const MIN_SECONDS_PER_WEIGHT = 0.06;
            const estimatedDurationNeeded = grandTotalWeight * MIN_SECONDS_PER_WEIGHT;
            const durationBase = Math.max(timing.duration, 0.1);
            
            // The "Canvas" size (Total time we visualize over)
            const effectiveDuration = Math.max(durationBase, estimatedDurationNeeded);

            // --- STEP 4: FIND ACTIVE BUCKET ---
            // Instead of linear mapping over the whole text, we find which sentence bucket we are in.
            const globalProgressPct = Math.min(1, Math.max(0, elapsed / effectiveDuration));
            
            let activeWordGlobalIndex = -1;

            // Logic:
            // 1. Iterate buckets.
            // 2. If globalProgress > bucketEnd, mark all words in bucket as DONE.
            // 3. If globalProgress < bucketStart, mark all words in bucket as FUTURE.
            // 4. If inside bucket, calculate LOCAL progress and find active word.

            for (const bucket of buckets) {
                const bucketEndPct = bucket.startTimePct + bucket.durationPct;
                
                if (globalProgressPct >= bucketEndPct) {
                    // We are past this sentence. The last word of this bucket is the "active" boundary.
                    const lastWord = bucket.words[bucket.words.length - 1];
                    activeWordGlobalIndex = lastWord.globalIndex;
                } else if (globalProgressPct < bucket.startTimePct) {
                    // We haven't reached this sentence yet. Stop checking.
                    break; 
                } else {
                    // ** WE ARE INSIDE THIS SENTENCE **
                    // Calculate local progress (0.0 to 1.0) WITHIN this specific sentence
                    const progressInBucket = (globalProgressPct - bucket.startTimePct) / bucket.durationPct;
                    
                    // Map local progress to weights inside this bucket
                    const targetWeightInBucket = progressInBucket * bucket.totalWeight;
                    
                    let localWeightSum = 0;
                    for (const wObj of bucket.words) {
                        localWeightSum += wObj.weight;
                        if (localWeightSum >= targetWeightInBucket) {
                            activeWordGlobalIndex = wObj.globalIndex;
                            break;
                        }
                    }
                    // Since we found the active bucket, no need to check further buckets
                    break;
                }
            }

            // RATCHET: Prevent jumping backward
            if (activeWordGlobalIndex > maxReachedIndexRef.current) {
                maxReachedIndexRef.current = activeWordGlobalIndex;
            }
            
            const renderIndex = maxReachedIndexRef.current;
            const spans = containerRef.current.children;
            let currentSpanIndex = 0;

            // RENDER LOOP
            for (let i = 0; i < spans.length; i++) {
                const span = spans[i];
                if (currentSpanIndex <= renderIndex) {
                    span.classList.add('active');
                } else {
                    span.classList.remove('active');
                }
                currentSpanIndex++;
            }

            if (elapsed < effectiveDuration + 1.0) {
                frameRef.current = requestAnimationFrame(animate);
            } else {
                // FORCE FINISH
                for (let i = 0; i < spans.length; i++) {
                    spans[i].classList.add('active');
                }
            }
        };

        frameRef.current = requestAnimationFrame(animate);

        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [timing, audioContext, text]); 

    return containerRef;
}
