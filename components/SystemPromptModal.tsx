
import React, { useState, useEffect } from 'react';
import { PROMPT_PRESETS, injectVariables } from '../utils/promptBuilder';

interface SystemPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  customSystemInstruction: string | null;
  setCustomSystemInstruction: (text: string | null) => void;
  targetLanguages: string[];
  onLanguagesChange: (langs: string[]) => void;
  aiSpeakingRate: number;
  allLanguages: string[]; 
}

const SystemPromptModal: React.FC<SystemPromptModalProps> = ({
  isOpen,
  onClose,
  customSystemInstruction,
  setCustomSystemInstruction,
  targetLanguages,
  onLanguagesChange,
  allLanguages
}) => {
  const [activeText, setActiveText] = useState('');
  
  // 'custom' = The single editable slot.
  // 'preset_ID' = A read-only view of a built-in preset.
  const [viewMode, setViewMode] = useState<string>('custom'); 
  
  const [lang1, setLang1] = useState('Svenska');
  const [lang2, setLang2] = useState('English');

  // SYNC WITH APP LANGUAGES
  useEffect(() => {
      const l1 = targetLanguages[0] || 'Svenska';
      const l2 = targetLanguages[1] || 'English';
      setLang1(l1);
      setLang2(l2);
  }, [targetLanguages]);

  // INITIALIZATION ON OPEN
  useEffect(() => {
    if (isOpen) {
        // Decide what text to show and which mode we are in
        let textToShow = '';
        let mode = 'custom';

        // 1. Is there an active custom instruction?
        if (customSystemInstruction) {
            textToShow = customSystemInstruction;
            
            // 2. CHECK IF THIS MATCHES A PRESET (Smart Recognition)
            // We compare the saved text against the raw templates.
            const matchingPreset = PROMPT_PRESETS.find(p => p.template.trim() === customSystemInstruction.trim());
            
            if (matchingPreset) {
                // If the text matches a preset exactly (with brackets), we are in that preset mode
                mode = matchingPreset.id;
            } else {
                // Fallback: Check if it matches after variable injection (for legacy saved prompts)
                // This handles cases where user saved a prompt with "Svenska" hardcoded
                /* 
                   We skip this to encourage using brackets. If it doesn't match raw, 
                   it's considered "Custom" (Edited).
                */
            }
        } else {
            // Default to the first preset (Puppeteer)
            const defaultPreset = PROMPT_PRESETS[0];
            textToShow = defaultPreset.template;
            mode = defaultPreset.id;
        }

        setActiveText(textToShow);
        setViewMode(mode);
    }
  }, [isOpen, customSystemInstruction]);

  // Helper to sync changes back to the global app and localStorage
  const syncLanguagesGlobal = (l1: string, l2: string) => {
      onLanguagesChange([l1, l2]);
      try {
          const saved = localStorage.getItem('app_recent_languages');
          let recents: string[] = saved ? JSON.parse(saved) : [];
          if (l2) recents = [l2, ...recents.filter(l => l !== l2)];
          if (l1) recents = [l1, ...recents.filter(l => l !== l1)];
          localStorage.setItem('app_recent_languages', JSON.stringify(recents.slice(0, 7)));
      } catch (e) { console.error(e); }
  };

  const handleLanguageChange = (slot: 1 | 2, value: string) => {
      if (slot === 1) {
          setLang1(value);
          syncLanguagesGlobal(value, lang2);
      } else {
          setLang2(value);
          syncLanguagesGlobal(lang1, value);
      }
      // Note: We DO NOT update activeText here. 
      // The text contains {{L1}}, so it updates dynamically at runtime.
  };

  const handleSwapLanguages = () => {
      const temp = lang1;
      setLang1(lang2);
      setLang2(temp);
      syncLanguagesGlobal(lang2, temp);
  };

  const loadPreset = (id: string) => {
      const preset = PROMPT_PRESETS.find(p => p.id === id);
      if (preset) {
          // Load the RAW template with brackets
          setActiveText(preset.template);
          setViewMode(id);
      }
  };

  const selectCustomSlot = () => {
      // If we are in custom mode, we just stay there. 
      // If we were in a preset, we keep the text but unlock editing.
      setViewMode('custom');
  };

  const handleTrashCustom = (e: React.MouseEvent) => {
      e.stopPropagation(); 
      if (confirm("Vill du återställa till standardmallen?")) {
          // Reset to default preset
          const defaultPreset = PROMPT_PRESETS[0];
          setCustomSystemInstruction(null); 
          setActiveText(defaultPreset.template);
          setViewMode(defaultPreset.id); 
      }
  };

  const handleApply = () => {
      // Always save the current text buffer.
      // Ideally, this text contains {{L1}} brackets.
      setCustomSystemInstruction(activeText);
      onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl h-[90vh] shadow-2xl flex overflow-hidden animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* LEFT SIDEBAR: LIBRARY */}
        <div className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0">
            <div className="p-4 border-b border-slate-800 bg-slate-950">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Bibliotek</h3>
                <p className="text-[10px] text-slate-400">Välj strategi</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                
                {/* 1. THE SINGLE CUSTOM SLOT */}
                <div className="relative group">
                    <button 
                        onClick={selectCustomSlot}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${
                            viewMode === 'custom'
                            ? 'bg-indigo-900/30 border-indigo-500 text-white shadow-lg'
                            : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                        }`}
                    >
                        <div className="font-bold text-xs flex items-center gap-2">
                            MIN ANPASSADE MALL
                            {customSystemInstruction && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>}
                        </div>
                        <div className={`text-[9px] mt-1 leading-tight ${viewMode === 'custom' ? 'text-indigo-200' : 'text-slate-500'}`}>
                            {viewMode === 'custom' ? "Redigerar..." : (customSystemInstruction ? "Sparad" : "Tom")}
                        </div>
                    </button>
                    
                    {/* TRASH CAN */}
                    {customSystemInstruction && (
                        <button 
                            onClick={handleTrashCustom}
                            className="absolute top-3 right-2 text-slate-600 hover:text-red-400 p-1 transition-colors z-20"
                            title="Släng och återställ till standard"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    )}
                </div>

                <div className="h-px bg-slate-800 my-2 mx-2"></div>

                {/* 2. BUILT-IN PRESETS */}
                {PROMPT_PRESETS.map(preset => (
                    <button 
                        key={preset.id}
                        onClick={() => loadPreset(preset.id)}
                        className={`w-full text-left p-3 rounded-lg transition-all border ${
                            viewMode === preset.id 
                            ? 'bg-slate-800 border-slate-600 text-white' 
                            : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                        }`}
                    >
                        <div className="font-bold text-xs flex items-center gap-2">
                            {preset.name}
                        </div>
                        <div className="text-[9px] mt-1 leading-tight text-slate-500 line-clamp-2">
                            {preset.description}
                        </div>
                    </button>
                ))}
            </div>
        </div>

        {/* RIGHT: EDITOR */}
        <div className="flex-1 flex flex-col bg-slate-900">
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 shrink-0">
                <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        {viewMode === 'custom' ? 'Redigerare (Anpassad)' : PROMPT_PRESETS.find(p => p.id === viewMode)?.name}
                        {viewMode !== 'custom' && (
                            <span className="text-[9px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded border border-slate-600">MALL (Läsläge)</span>
                        )}
                    </h2>
                    <p className="text-xs text-slate-400">
                        {viewMode === 'custom' 
                            ? "Klamrarna {{L1}} och {{L2}} byts ut automatiskt mot valda språk." 
                            : "Detta är en mall. Klicka i texten för att redigera och skapa en kopia."}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={onClose} className="px-3 py-1.5 text-slate-400 hover:text-white text-xs">Avbryt</button>
                    <button 
                        onClick={handleApply} 
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-indigo-500/20"
                    >
                        ANVÄND DENNA
                    </button>
                </div>
            </div>

            {/* CONFIGURATION BAR (Variables) */}
            <div className="bg-slate-950 p-3 border-b border-slate-800 flex flex-wrap items-center gap-4 animate-in slide-in-from-top-2 shrink-0">
                <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider">{'{{L1}}'} (Källa)</label>
                    <select 
                        value={lang1}
                        onChange={(e) => handleLanguageChange(1, e.target.value)}
                        className="bg-slate-800 text-white text-xs rounded px-2 py-1 border border-slate-700 focus:border-indigo-500 outline-none min-w-[120px]"
                    >
                        {allLanguages.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                </div>

                <button 
                    onClick={handleSwapLanguages}
                    className="mt-4 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700"
                    title="Växla språk"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                </button>

                <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-fuchsia-400 uppercase tracking-wider">{'{{L2}}'} (Mål)</label>
                    <select 
                        value={lang2}
                        onChange={(e) => handleLanguageChange(2, e.target.value)}
                        className="bg-slate-800 text-white text-xs rounded px-2 py-1 border border-slate-700 focus:border-indigo-500 outline-none min-w-[120px]"
                    >
                        {allLanguages.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                </div>
                
                <div className="flex-1"></div>
                <div className="text-[10px] text-slate-500 italic max-w-xs text-right hidden md:block">
                    {viewMode === 'custom' 
                        ? "Tips: Använd {{L1}} och {{L2}} i texten för dynamiska byten." 
                        : "Mallar använder automatiskt {{L1}} och {{L2}}."}
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 relative group">
                <textarea 
                    value={activeText}
                    onChange={(e) => {
                        setActiveText(e.target.value);
                        // If user types while viewing a preset, switch to custom mode
                        if (viewMode !== 'custom') setViewMode('custom');
                    }}
                    className="w-full h-full bg-slate-900 p-6 text-sm font-mono text-slate-300 focus:outline-none resize-none leading-relaxed selection:bg-indigo-500/30"
                    spellCheck={false}
                />
            </div>

            {/* Footer Status */}
            <div className="p-2 border-t border-slate-800 bg-slate-950 flex justify-between items-center shrink-0">
                <div className="text-[10px] text-slate-500">
                    {viewMode === 'custom' ? "Redigerar Anpassad Mall" : `Visar mall: ${PROMPT_PRESETS.find(p=>p.id===viewMode)?.name}`}
                </div>
                <div className="text-[10px] text-slate-600 font-mono">
                    {activeText.length} tecken
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default SystemPromptModal;
