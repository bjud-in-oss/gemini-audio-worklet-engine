import React from 'react';

interface ControlBarProps {
  activeMode: 'translate' | 'pause' | 'off';
  setMode: (mode: 'translate' | 'pause' | 'off') => void;
}

const ControlBar: React.FC<ControlBarProps> = ({
  activeMode,
  setMode
}) => {
  
  // Calculate slider position
  let sliderPosition = 'left-1.5';
  let indicatorStyle = 'bg-slate-800 border-slate-600';
  let width = 'w-[30%]'; // Base width

  if (activeMode === 'off') {
      sliderPosition = 'left-1.5';
      indicatorStyle = 'bg-slate-800 border-slate-600';
  } else if (activeMode === 'pause') {
      sliderPosition = 'left-[34%]'; // Center position
      indicatorStyle = 'bg-yellow-600 border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.4)]';
  } else if (activeMode === 'translate') {
      sliderPosition = 'left-[68%]'; // Right position (accounting for padding)
      indicatorStyle = 'bg-indigo-600 border-indigo-400 shadow-[0_0_15px_rgba(79,70,229,0.4)]';
  }

  // Helper for text color
  const getTextClass = (target: string) => {
      if (activeMode === target) return 'text-white';
      return 'text-slate-500 hover:text-slate-300';
  };

  return (
    <div className="absolute bottom-8 left-0 right-0 z-40 flex items-center justify-center pointer-events-none px-6">
      
      <div className="relative w-full max-w-sm flex items-center justify-center">

        {/* THE 3-STATE TOGGLE SWITCH */}
        <div className="pointer-events-auto relative bg-slate-900 border border-slate-700 p-1.5 rounded-full h-16 w-80 shadow-2xl flex items-center justify-between z-20">
            
            {/* Sliding Indicator */}
            <div 
              className={`absolute top-1.5 bottom-1.5 w-[31%] rounded-full transition-all duration-300 ease-out shadow-inner border ${sliderPosition} ${indicatorStyle}`}
            />

            {/* BUTTONS */}
            
            {/* OFF */}
            <button 
              onClick={() => setMode('off')}
              className={`relative z-10 flex-1 h-full flex items-center justify-center font-bold tracking-wider text-sm transition-colors duration-300 ${getTextClass('off')}`}
            >
                AV
            </button>

            {/* PAUSE */}
            <button 
              onClick={() => setMode('pause')}
              className={`relative z-10 flex-1 h-full flex items-center justify-center font-bold tracking-wider text-sm transition-colors duration-300 ${getTextClass('pause')}`}
            >
                <div className="flex items-center gap-1">
                    <span>PAUS</span>
                    {activeMode === 'pause' && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                    )}
                </div>
            </button>

            {/* ON */}
            <button 
              onClick={() => setMode('translate')}
              className={`relative z-10 flex-1 h-full flex items-center justify-center space-x-2 transition-colors duration-300 ${getTextClass('translate')}`}
            >
                <span className="font-bold tracking-wider text-sm">PÅ</span>
                 {/* Icon only visible when ON */}
                 {activeMode === 'translate' && (
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                     </svg>
                 )}
            </button>
        </div>

      </div>
    </div>
  );
};

export default ControlBar;