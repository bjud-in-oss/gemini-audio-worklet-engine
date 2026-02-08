
import React, { useState, useEffect, useRef } from 'react';
import RoomSelectorModal from './RoomSelectorModal';
import { useTabCoordination } from '../hooks/useTabCoordination';

interface HeaderControlsProps {
  currentRoom: string;
  onRoomChange: (room: string) => void;
  userLanguage: string;
  onOpenLangModal: () => void;
  onCloseLangModal?: () => void;
  isLangModalOpen?: boolean; 
  onOpenSettings: () => void;
  status: string;
  isTranscriptionEnabled?: boolean;
  setIsTranscriptionEnabled?: (enabled: boolean) => void;
  currentPlaybackRate?: number;
  showSubtitles?: boolean;
  onToggleSubtitles?: () => void;
  onToggleTower?: () => void;
  targetLanguages?: string[];
  allLanguages?: string[]; 
  
  inputDeviceId?: string;
  setInputDeviceId?: (id: string) => void;
  outputDeviceId?: string;
  setOutputDeviceId?: (id: string) => void;
  
  hasEverConnected?: boolean;
}

const HeaderControls: React.FC<HeaderControlsProps> = ({
  currentRoom,
  onRoomChange,
  userLanguage,
  targetLanguages = [],
  allLanguages = [],
  onOpenLangModal,
  onCloseLangModal,
  isLangModalOpen = false,
  onOpenSettings,
  status,
  isTranscriptionEnabled,
  setIsTranscriptionEnabled,
  currentPlaybackRate = 1.0,
  showSubtitles,
  onToggleSubtitles,
  onToggleTower,
  inputDeviceId,
  setInputDeviceId,
  outputDeviceId,
  setOutputDeviceId,
  hasEverConnected
}) => {
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [isWaitingForModal, setIsWaitingForModal] = useState(false); // Prevents snap-back during transition
  
  // ACTIVE MODAL STATE
  const isLangActive = isLangModalOpen;
  
  // HERO MODE STATE
  const hasLanguage = targetLanguages && targetLanguages.length > 0 && targetLanguages[0] !== '';
  const [isHeroMode, setIsHeroMode] = useState(!hasLanguage);

  useEffect(() => {
      // If we have a language, we are generally NOT in hero mode (unless resetting)
      if (hasLanguage && !isLangModalOpen) setIsHeroMode(false);
  }, [hasLanguage]); 

  // Reset waiting state when modal actually opens
  useEffect(() => {
      if (isLangModalOpen) setIsWaitingForModal(false);
  }, [isLangModalOpen]);

  // Animation State
  const [placeholderLang, setPlaceholderLang] = useState("");
  const shuffledIndicesRef = useRef<number[]>([]);
  const currentIndexRef = useRef(0);

  const { otherTabs } = useTabCoordination(currentRoom, [userLanguage]);

  const handleLangClick = () => {
    if (isHeroMode) {
        setIsWaitingForModal(true); // Lock state to prevent revert
        setIsHeroMode(false); // Trigger Visual Transition (Move to top)
        
        // Wait for CSS transition to establish before opening modal
        setTimeout(() => {
            onOpenLangModal();
        }, 600);
    } else {
        if (isLangActive) {
            if(onCloseLangModal) onCloseLangModal();
        } else {
            setShowRoomModal(false); 
            onOpenLangModal();
        }
    }
  };

  const handleRoomClick = () => {
    if (showRoomModal) {
        setShowRoomModal(false);
    } else {
        if (onCloseLangModal) onCloseLangModal(); 
        setShowRoomModal(true);
    }
  };

  // RETURN TO HERO LOGIC
  useEffect(() => {
      // Revert to Hero Mode ONLY if:
      // 1. No language selected
      // 2. Not currently in Hero Mode
      // 3. Language Modal is CLOSED 
      // 4. Room Modal is CLOSED
      // 5. We are NOT currently waiting for the modal to open (The Fix)
      if (!hasLanguage && !isHeroMode && !isLangModalOpen && !showRoomModal && !isWaitingForModal) {
          const timer = setTimeout(() => setIsHeroMode(true), 500);
          return () => clearTimeout(timer);
      }
  }, [hasLanguage, isHeroMode, isLangModalOpen, showRoomModal, isWaitingForModal]);


  const isSubsOn = showSubtitles !== undefined ? showSubtitles : isTranscriptionEnabled;

  const handleSubtitleToggle = () => {
      if (onToggleSubtitles) {
          onToggleSubtitles();
      } else if (setIsTranscriptionEnabled) {
          setIsTranscriptionEnabled(!isTranscriptionEnabled);
      }
  };
  
  // STATUS BORDER LOGIC
  const getStatusBorder = (isActive: boolean) => {
      if (isActive) return 'border-white ring-4 ring-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.5)] bg-slate-800 scale-110';
      
      switch (status) {
          case 'connected': return 'border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)] bg-slate-800';
          case 'connecting': return 'border-yellow-500 animate-pulse bg-slate-800';
          case 'error': return 'border-red-500 bg-slate-800';
          case 'standby': return 'border-blue-500 animate-pulse bg-slate-800';
          default: return 'border-slate-700 bg-slate-800/80 hover:bg-slate-700 hover:border-slate-600'; 
      }
  };

  // Cycling Logic
  useEffect(() => {
      if (hasLanguage || allLanguages.length === 0) return;
      const shuffle = () => {
          const indices = allLanguages.map((_, i) => i);
          for (let i = indices.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [indices[i], indices[j]] = [indices[j], indices[i]];
          }
          return indices;
      };
      if (shuffledIndicesRef.current.length === 0) {
          shuffledIndicesRef.current = shuffle();
          currentIndexRef.current = 0;
      }
      const interval = setInterval(() => {
          const index = shuffledIndicesRef.current[currentIndexRef.current];
          setPlaceholderLang(allLanguages[index]);
          currentIndexRef.current++;
          if (currentIndexRef.current >= shuffledIndicesRef.current.length) {
              shuffledIndicesRef.current = shuffle();
              currentIndexRef.current = 0;
          }
      }, 2500);
      if (!placeholderLang) setPlaceholderLang(allLanguages[shuffledIndicesRef.current[0]]);
      return () => clearInterval(interval);
  }, [hasLanguage, allLanguages]);

  const formatLang = (raw: string) => raw ? raw.split('(')[0].trim() : "";

  // LAYOUT LOGIC
  const wrapperClass = isHeroMode
      ? "fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all duration-700 ease-in-out"
      : "fixed top-0 left-0 w-full z-[60] flex items-start pt-6 transition-all duration-700 ease-in-out bg-gradient-to-b from-[#101010] to-transparent h-32";

  // ALWAYS CENTERED
  const containerClass = isHeroMode
      ? "justify-center gap-0 scale-125"
      : "justify-center gap-6 w-full max-w-7xl mx-auto";

  const showSubtitlesButton = hasEverConnected || status === 'connected';

  // HELPER: Common Button Styles
  // Note: overflow-hidden is important for smooth width transition
  const baseBtnClass = "relative flex items-center justify-center rounded-full backdrop-blur border-2 transition-all duration-500 ease-out shrink-0 group overflow-hidden";

  return (
    <>
      <div className={wrapperClass}>
        <div className={`relative flex items-center transition-all duration-700 ${containerClass}`}>
            
            {/* 1. LANGUAGE SELECTOR */}
            <div className="relative transition-all duration-500">
                <button 
                onClick={handleLangClick}
                className={`
                    ${baseBtnClass}
                    ${getStatusBorder(isLangActive)}
                    /* Width Transition: Fixed width (Icon) vs Auto width (Text) */
                    ${isHeroMode ? 'w-auto px-8 h-16' : 'w-14 h-14'} 
                `}
                >
                
                {/* ICON CONTAINER: Hidden in Hero, Visible in Docked */}
                <div 
                    className={`
                        text-indigo-300 group-hover:text-white transition-all duration-500 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                        ${isLangActive ? 'animate-pulse text-white' : ''}
                        ${isHeroMode ? 'w-0 opacity-0 scale-0' : 'w-6 opacity-100 scale-100 delay-200'}
                    `}
                >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                </div>

                {/* TEXT LABEL: Visible in Hero, Hidden in Docked */}
                <div 
                    className={`
                        flex flex-col items-center whitespace-nowrap transition-all duration-500
                        ${isHeroMode ? 'opacity-100 scale-100' : 'opacity-0 scale-0 w-0 h-0 absolute'}
                    `}
                >
                    <span className="font-bold text-xl text-white drop-shadow-md">
                        {formatLang(placeholderLang)}
                    </span>
                </div>
                
                </button>
            </div>

            {/* 2. ROOM SELECTOR (Hidden in Hero) */}
            {!isHeroMode && (
                <div className="transition-all duration-500 animate-in fade-in zoom-in slide-in-from-bottom-4">
                    <button 
                    onClick={handleRoomClick}
                    className={`
                        ${baseBtnClass} w-14 h-14
                        ${getStatusBorder(showRoomModal)}
                    `}
                    title={currentRoom}
                    >
                        <div className={`text-indigo-300 group-hover:text-white transition-colors ${showRoomModal ? 'animate-pulse text-white' : ''}`}>
                            {/* COMPOSITE ICON: Mic + Speaker + Wifi */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                {/* Speaker */}
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                {/* Mic (Small overlaid) */}
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7" opacity="0.6"/>
                            </svg>
                        </div>
                    </button>
                </div>
            )}

            {/* 3. SUBTITLES (Only if session started once, Hidden in Hero) */}
            {!isHeroMode && showSubtitlesButton && (
                <div className="transition-all duration-500 animate-in fade-in zoom-in slide-in-from-bottom-4">
                    <button 
                        onClick={handleSubtitleToggle}
                        className={`
                            ${baseBtnClass} w-14 h-14
                            ${getStatusBorder(false)}
                        `}
                        title={isSubsOn ? "Undertexter PÅ" : "Undertexter AV"}
                    >
                        <div className={`transition-colors ${isSubsOn ? 'text-green-400' : 'text-slate-500'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                        </div>
                        {/* Speed Indicator */}
                        <span className="absolute -bottom-2 bg-slate-900 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-slate-700 text-slate-400">
                            {currentPlaybackRate.toFixed(1)}x
                        </span>
                    </button>
                </div>
            )}

        </div>
      </div>

      <RoomSelectorModal 
        isOpen={showRoomModal}
        onClose={() => { setShowRoomModal(false); }}
        currentRoom={currentRoom}
        onSelectRoom={onRoomChange}
        inputDeviceId={inputDeviceId}
        setInputDeviceId={setInputDeviceId}
        outputDeviceId={outputDeviceId}
        setOutputDeviceId={setOutputDeviceId}
        onToggleTower={onToggleTower}
      />
    </>
  );
};

export default HeaderControls;
