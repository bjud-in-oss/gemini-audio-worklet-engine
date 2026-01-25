import { useMemo } from 'react';

// --- CONFIGURATION CONSTANTS ---
// Adjust these central values to tune the feeling globally
const HARDWARE_LATENCY_OFFSET = 0.15; // 150ms delay to match audio output
const WORD_SUSTAIN_RATIO = 0.6;       // Words stay white for 60% of their slot
const MIN_FLOW_DURATION_PER_WORD = 0.1; // Minimum time per word to avoid instant flashing

export interface TimingItem {
  word: string;
  index: number;
  delay: string;
  duration: string;
}

export function useKaraokeTiming(text: string, audioDuration: number = 2.0) {
  return useMemo(() => {
    const words = text.trim().split(/\s+/);
    if (words.length === 0 || (words.length === 1 && words[0] === '')) return [];

    const totalChars = words.reduce((acc, w) => acc + w.length, 0);
    
    // Safety check: Ensure animation time isn't impossibly short for long sentences
    const flowDuration = Math.max(audioDuration, words.length * MIN_FLOW_DURATION_PER_WORD);

    let currentTime = HARDWARE_LATENCY_OFFSET;

    return words.map((word, index) => {
      const weight = word.length;
      
      // Calculate how much time this specific word gets based on length
      const wordDuration = (weight / totalChars) * flowDuration;
      const startTime = currentTime;
      
      currentTime += wordDuration;

      // Calculate CSS animation values
      const animDuration = wordDuration / WORD_SUSTAIN_RATIO;

      return {
        word,
        index,
        delay: startTime.toFixed(3) + 's',
        duration: animDuration.toFixed(3) + 's'
      };
    });
  }, [text, audioDuration]);
}