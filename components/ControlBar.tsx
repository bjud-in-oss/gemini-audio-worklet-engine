
import React from 'react';

interface ControlBarProps {
  activeMode: 'translate' | 'pause' | 'off';
  setMode: (mode: 'translate' | 'pause' | 'off') => void;
}

const ControlBar: React.FC<ControlBarProps> = ({
  activeMode,
  setMode
}) => {
  
  let sliderPosition = 'left-1.5';
  let indicatorStyle = 'bg-slate-800 border-slate-600';
  
  if (activeMode === 'off') {
      sliderPosition = 'left-1.5';
      indicatorStyle = 'bg-slate-800 border-slate-600';
  } else if (activeMode === 'pause') {
      sliderPosition = 'left-[34%]'; 
      // Amber/Gold for Pause
      indicatorStyle = 'bg-amber-500 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)]';
  } else if (activeMode === 'translate') {
      sliderPosition = 'left-[68%]'; 
      // Indigo/Purple for Active
      indicatorStyle = 'bg-indigo-500 border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.6)]';
  }

  const getTextClass = (target: string) => {
      if (activeMode === target) return 'text-white';
      return 'text-slate-500 hover:text-slate-300';
  };

  return (
    <div className="absolute bottom-8 left-0 right-0 z-40 flex items-center justify-center pointer-events-none px-6">
      
      <div className="relative w-full max-w-sm flex items-center justify-center">

        <div className="pointer-events-auto relative bg-slate-900 border border-slate-700 p-1.5 rounded-full h-16 w-80 shadow-2xl flex items-center justify-between z-20">
            
            <div 
              className={`absolute top-1.5 bottom-1.5 w-[31%] rounded-full transition-all duration-300 ease-out shadow-inner border ${sliderPosition} ${indicatorStyle}`}
            />

            {/* OFF (Power Icon - Simplified) */}
            <button 
              onClick={() => setMode('off')}
              className={`relative z-10 flex-1 h-full flex items-center justify-center transition-colors duration-300 ${getTextClass('off')}`}
              aria-label="Stäng av"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            {/* PAUSE (Pause Icon - Bigger) */}
            <button 
              onClick={() => setMode('pause')}
              className={`relative z-10 flex-1 h-full flex items-center justify-center transition-colors duration-300 ${getTextClass('pause')}`}
              aria-label="Pausa"
            >
                {/* Increased size from h-6 w-6 to h-8 w-8 */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 9v6m4-6v6" />
                </svg>
            </button>

            {/* ON (Mic Icon - Clean) */}
            <button 
              onClick={() => setMode('translate')}
              className={`relative z-10 flex-1 h-full flex items-center justify-center transition-colors duration-300 ${getTextClass('translate')}`}
              aria-label="Slå på"
            >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                 </svg>
            </button>
        </div>

      </div>
    </div>
  );
};

export default ControlBar;
