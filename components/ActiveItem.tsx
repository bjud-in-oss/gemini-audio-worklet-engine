
import React, { useMemo } from 'react';
import { PhraseTiming } from '../types';
import { useKaraokeAnimation } from '../hooks/useKaraokeAnimation';

interface ActiveItemProps {
  text: string;
  timing: PhraseTiming | null; // UPDATED: Can be null
  audioContext: AudioContext | null;
}

const ActiveItem: React.FC<ActiveItemProps> = ({ text, timing, audioContext }) => {
  
  // Split text into words once to avoid re-calculation on every render
  const words = useMemo(() => {
      // Split by spaces but keep the structure
      return text.split(' ');
  }, [text]);

  // Connect to the rAF Engine which will manipulate the DOM directly
  const containerRef = useKaraokeAnimation(timing, audioContext, text);

  return (
    <div className="relative w-full text-left py-4">
      {/* 
          We render specific spans for each word.
          The useKaraokeAnimation hook will toggle the 'active' class on these spans directly.
      */}
      <div 
        ref={containerRef}
        className="font-sans text-3xl md:text-4xl leading-tight font-medium tracking-wide"
      >
        {words.map((word, index) => (
            <span key={index} className="k-word mr-2 mb-1">
                {word}
            </span>
        ))}
      </div>
    </div>
  );
};

export default ActiveItem;
