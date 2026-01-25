
import React, { useRef } from 'react';
import { AudioGroup, PhraseTiming } from '../types';
import ActiveItem from './ActiveItem';
import HistoryItem from './HistoryItem';
import { useScrollPhysics } from '../hooks/useScrollPhysics';

interface SubtitleOverlayProps {
  activeGroup: AudioGroup | null;
  activePhraseTiming: PhraseTiming | null;
  history: AudioGroup[];
  queue: AudioGroup[];
  audioContext: AudioContext | null;
}

export const SubtitleOverlay: React.FC<SubtitleOverlayProps> = ({ 
    activeGroup, 
    activePhraseTiming, 
    history,
    audioContext 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLDivElement>(null); 
  
  // Use the physics engine hook
  const { handleUserInteraction, handleScrollEvent } = useScrollPhysics({
      containerRef,
      activeItemRef,
      trigger: activeGroup?.id // Restart physics when ID changes
  });

  return (
    <div 
      ref={containerRef}
      onWheel={handleUserInteraction}       // Mouse Wheel
      onTouchStart={handleUserInteraction}  // Finger touch
      onTouchMove={handleUserInteraction}   // Finger drag
      onMouseDown={handleUserInteraction}   // Scrollbar click
      onScroll={handleScrollEvent}          // Passive sync
      className="absolute inset-0 z-30 overflow-y-auto overflow-x-hidden scrollbar-hide px-6 md:px-12 flex flex-col"
    >
      {/* 
          LAYOUT BUFFER:
          pb-[50vh] ensures the "Reading Zone" logic can always center the text,
          even if it's the very last line in the document.
      */}
      <div className="mt-auto pt-[30vh] pb-[50vh] flex flex-col gap-6 max-w-2xl mx-auto w-full transition-all">
        
        {/* HISTORY LAYER */}
        {history.map((item) => (
            <div key={item.id} className="opacity-50 transition-opacity duration-500">
                <HistoryItem text={item.text} />
            </div>
        ))}

        {/* ACTIVE LAYER */}
        {/* 
            We render ActiveItem even if activePhraseTiming is null (Linger Effect).
            The physics engine keeps this element in the "Reading Zone".
        */}
        {activeGroup && (
          <div ref={activeItemRef} className="transition-all duration-300">
            <ActiveItem 
              key={activeGroup.id} 
              text={activeGroup.text} 
              timing={activePhraseTiming}
              audioContext={audioContext}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SubtitleOverlay;
