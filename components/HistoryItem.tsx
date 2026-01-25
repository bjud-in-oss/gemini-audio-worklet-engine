import React, { memo } from 'react';

interface HistoryItemProps {
  text: string;
}

const HistoryItem: React.FC<HistoryItemProps> = memo(({ text }) => {
  return (
    <div className="relative w-full text-left">
      {/* 
         UPDATED: Changed text-slate-400 to text-white/90.
         This keeps the history visible and "lit" even after the active phase moves on.
      */}
      <div className="font-sans text-2xl md:text-3xl leading-[1.8] text-white/90 font-normal tracking-wide transition-opacity duration-1000">
        {text}
      </div>
    </div>
  );
});

HistoryItem.displayName = 'HistoryItem';

export default HistoryItem;