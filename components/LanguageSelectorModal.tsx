
import React, { useState, useEffect, useMemo, useRef } from 'react';

interface LanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (languages: string[]) => void;
  currentLanguages: string[];
  allLanguages: string[];
  isSingleSelection: boolean;
}

const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentLanguages,
  allLanguages,
  isSingleSelection
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const [slot0, setSlot0] = useState<string | null>(null);
  const [slot1, setSlot1] = useState<string | null>(null);
  
  const [activeSearchSlot, setActiveSearchSlot] = useState<0 | 1 | null>(0);

  const inputRef0 = useRef<HTMLInputElement>(null);
  const inputRef1 = useRef<HTMLInputElement>(null);
  
  const [recentLanguages, setRecentLanguages] = useState<string[]>([]);

  useEffect(() => {
      try {
          const saved = localStorage.getItem('app_recent_languages');
          if (saved) setRecentLanguages(JSON.parse(saved));
      } catch (e) { console.error(e); }
  }, []);

  const addToHistory = (lang: string) => {
      if (!lang) return;
      setRecentLanguages(prev => {
          const filtered = prev.filter(l => l !== lang);
          const newRecents = [lang, ...filtered].slice(0, 7);
          localStorage.setItem('app_recent_languages', JSON.stringify(newRecents));
          return newRecents;
      });
  };

  useEffect(() => {
    if (isOpen) {
        const s0 = currentLanguages[0] || null;
        const s1 = currentLanguages[1] || null;
        setSlot0(s0);
        setSlot1(s1);
        setSearchTerm('');
        if (!s0) setActiveSearchSlot(0);
        else if (!s1 && !isSingleSelection) setActiveSearchSlot(1);
        else setActiveSearchSlot(null);
    }
  }, [isOpen, currentLanguages, isSingleSelection]);

  useEffect(() => {
      if (activeSearchSlot === 0 && inputRef0.current) inputRef0.current.focus();
      else if (activeSearchSlot === 1 && inputRef1.current) inputRef1.current.focus();
  }, [activeSearchSlot]);

  const handleListSelection = (newLang: string) => {
      let targetSlot = activeSearchSlot;
      
      // If we are filling slot 0, automagically jump to slot 1 if it exists and is empty
      if (targetSlot === 0) {
          if (slot0 && slot0 !== newLang) addToHistory(slot0);
          setSlot0(newLang);
          
          if (!isSingleSelection) {
              setActiveSearchSlot(1); // Auto-jump
          } else {
              setActiveSearchSlot(null);
          }
      } else if (targetSlot === 1) {
          if (slot1 && slot1 !== newLang) addToHistory(slot1);
          setSlot1(newLang);
          setActiveSearchSlot(null);
      }
      setSearchTerm('');
  };

  const performClear = (index: 0 | 1) => {
      if (index === 0) { if (slot0) addToHistory(slot0); setSlot0(null); setActiveSearchSlot(0); } 
      else { if (slot1) addToHistory(slot1); setSlot1(null); setActiveSearchSlot(1); }
  };

  const handleClearButton = (e: React.MouseEvent, index: 0 | 1) => {
      e.stopPropagation(); performClear(index);
  };

  const handleSlotClick = (slotIndex: 0 | 1) => {
      setActiveSearchSlot(slotIndex); setSearchTerm('');
  };

  const handleSave = () => {
      const result = [];
      if (slot0) result.push(slot0);
      if (slot1) result.push(slot1);
      
      let newHistory = recentLanguages;
      if (slot1) newHistory = [slot1, ...newHistory.filter(l => l !== slot1)];
      if (slot0) newHistory = [slot0, ...newHistory.filter(l => l !== slot0)];
      newHistory = newHistory.slice(0, 7);
      setRecentLanguages(newHistory);
      localStorage.setItem('app_recent_languages', JSON.stringify(newHistory));

      onSave(result);
      onClose();
  };

  const { historyList, alphaList } = useMemo(() => {
      const available = allLanguages.filter(l => l !== slot0 && l !== slot1);
      const filtered = available.filter(l => l.toLowerCase().includes(searchTerm.toLowerCase()));
      const historyCandidates = recentLanguages.filter(l => available.includes(l)).slice(0, 3);

      if (searchTerm) return { historyList: [], alphaList: filtered.sort((a, b) => a.localeCompare(b)) };
      const others = filtered.filter(l => !historyCandidates.includes(l));
      return { historyList: historyCandidates, alphaList: others.sort((a, b) => a.localeCompare(b)) };
  }, [allLanguages, searchTerm, slot0, slot1, recentLanguages]);

  const isRecent = (lang: string) => recentLanguages.includes(lang);

  if (!isOpen) return null;

  const renderSlotRow = (index: 0 | 1, lang: string | null, label: string, baseColor: string, inputRef: React.RefObject<HTMLInputElement | null>) => {
      const isActiveSearch = activeSearchSlot === index;
      const isSelected = !!lang && !isActiveSearch;
      
      let containerClass = "bg-[#1a1a1a] border-[#333]";
      if (isActiveSearch) containerClass = `bg-[#1a1a1a] border-${baseColor}-500 shadow-[0_0_15px_rgba(var(--color-${baseColor}-500),0.2)]`;
      if (isSelected) containerClass = `bg-${baseColor}-900/20 border-${baseColor}-500/50`;

      return (
          <div onClick={() => lang ? performClear(index) : handleSlotClick(index)} className={`w-full px-4 py-4 rounded-xl flex items-center justify-between transition-all duration-300 border-2 cursor-pointer ${containerClass}`}>
              <div className="flex items-center gap-4 flex-1">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? `bg-${baseColor}-500 border-${baseColor}-500` : 'border-slate-600'}`}>
                      {isSelected && <svg className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                  </div>
                  <div className="flex-1 relative h-6 flex items-center">
                      {isActiveSearch ? (
                          <div className="relative w-full">
                              {/* MAGNIFYING GLASS ICON */}
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                  </svg>
                              </div>
                              <input 
                                ref={inputRef} 
                                type="text" 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                                className="w-full bg-transparent text-white text-lg font-bold outline-none pl-8" 
                                autoFocus 
                                onClick={(e) => e.stopPropagation()} 
                              />
                          </div>
                      ) : (
                          <div className="flex items-center justify-between w-full">
                              {lang ? <span className="font-bold text-lg text-white truncate">{lang}</span> : <span className="text-slate-500 italic flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> </span>}
                              {lang && <button onClick={(e) => handleClearButton(e, index)} className="p-1 hover:bg-white/10 rounded-full"><svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>}
                          </div>
                      )}
                  </div>
              </div>
              <span className={`text-xs font-bold font-mono ml-3 ${isSelected ? `text-${baseColor}-400` : 'text-slate-600'}`}>{label}</span>
          </div>
      );
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end md:justify-center items-center pointer-events-none">
      {/* GLOBAL CLOSE BUTTON */}
      <button onClick={onClose} className="fixed top-6 right-6 z-[120] pointer-events-auto p-3 bg-black/40 hover:bg-red-500/20 rounded-full transition-colors group">
          <svg className="w-6 h-6 text-slate-400 group-hover:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>

      {/* BACKDROP */}
      <div className="absolute inset-0 bg-[#101010] pointer-events-auto" style={{ top: '100px' }} onClick={onClose}></div>

      {/* CONTENT CONTAINER - 100px Top Margin */}
      <div className="bg-[#101010] w-full max-w-md h-[calc(100vh-100px)] flex flex-col pointer-events-auto relative z-[110]" style={{ marginTop: '100px' }} onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER AREA (Slots) */}
        <div className="flex flex-col gap-3 p-6 shrink-0">
            {renderSlotRow(0, slot0, "1/2", "indigo", inputRef0)}
            {!isSingleSelection && renderSlotRow(1, slot1, "2/2", "rose", inputRef1)}
        </div>

        {/* LIST */}
        <div className="flex-1 overflow-y-auto px-2 scrollbar-hide pb-32">
          {historyList.map(lang => (
              <button key={lang} onClick={() => handleListSelection(lang)} className="w-full text-left px-6 py-4 flex items-center justify-between border-b border-slate-800/50 hover:bg-slate-900 group transition-colors rounded-lg">
                <span className="text-base text-slate-200 font-medium group-hover:text-white">{lang}</span>
                <svg className="w-4 h-4 text-slate-700 group-hover:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </button>
          ))}
          {alphaList.map(lang => (
            <button key={lang} onClick={() => handleListSelection(lang)} className="w-full text-left px-6 py-4 flex items-center justify-between border-b border-slate-800/50 hover:bg-slate-900 group transition-colors rounded-lg">
              <span className="text-base text-slate-400 font-normal group-hover:text-slate-200">{lang}</span>
              {isRecent(lang) && <svg className="w-4 h-4 text-slate-700 group-hover:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            </button>
          ))}
        </div>

        {/* FLOATING SAVE BUTTON */}
        <div className="absolute bottom-10 right-6 z-30">
            <button onClick={handleSave} className="bg-emerald-500 hover:bg-emerald-400 text-white p-5 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-transform hover:scale-110 flex items-center justify-center group">
                <svg className="w-8 h-8 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </button>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelectorModal;
