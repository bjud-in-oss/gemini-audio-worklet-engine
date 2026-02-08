
import React from 'react';

interface TowerMaintenanceProps {
    onClose: () => void;
}

const TowerMaintenance: React.FC<TowerMaintenanceProps> = ({ onClose }) => {
    return (
        <div className="w-full flex flex-col font-sans space-y-6">
            
            <div className="flex items-center gap-3 mb-2">
                <div className="bg-emerald-500/10 p-2 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                </div>
                <div>
                    <h2 className="font-bold text-slate-200 text-base">Systemhälsa & Underhåll</h2>
                    <p className="text-xs text-slate-500">Minneshantering och stabilitet</p>
                </div>
            </div>

            {/* SECTION 1: CRITICAL RESOURCES */}
            <section>
                <h4 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-3">
                    1. Kritisk Resurshantering
                </h4>
                <div className="text-sm text-slate-400 space-y-3 leading-relaxed">
                    <ul className="list-disc list-inside space-y-2 ml-1 text-slate-300">
                        <li>
                            <strong className="text-red-300">AudioContext:</strong> Måste stängas med <code>.close()</code> vid unmount. Webbläsare har en hård gräns (ofta 6 st).
                        </li>
                        <li>
                            <strong className="text-red-300">Blob URLs:</strong> Kartor och ljud som använder <code>createObjectURL</code> måste rensas med <code>revokeObjectURL</code>.
                        </li>
                        <li>
                            <strong className="text-red-300">ONNX Sessioner:</strong> VAD-modellen körs i WebAssembly. Minnet frigörs inte automatiskt. Kräv <code>session.release()</code>.
                        </li>
                    </ul>
                </div>
            </section>

            {/* SECTION 2: PRESTANDA */}
            <section>
                <h4 className="text-xs font-bold text-green-400 uppercase tracking-widest mb-3 mt-6">
                    2. Prestanda (AudioWorklet)
                </h4>
                <div className="bg-slate-900/50 p-3 rounded text-sm text-slate-400 space-y-3">
                    <p>
                        Vi har migrerat från <code>ScriptProcessor</code> till <code>AudioWorklet + MessagePort</code>. Detta eliminerar "klickljud" vid tung UI-rendering.
                    </p>
                    <div className="text-xs bg-indigo-900/20 p-2 rounded border border-indigo-500/30 text-indigo-300">
                        <strong>Buffert:</strong> 2048 samples (128ms). 50% lägre latens än tidigare.
                    </div>
                </div>
            </section>

            {/* SECTION 3: AI COMMANDS (FROM OLD GUIDE) */}
            <section>
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 mt-6">
                    3. Kommandon till AI-utvecklaren
                </h4>
                <div className="space-y-4">
                    <div className="bg-slate-900/50 p-3 rounded">
                        <div className="text-xs font-bold text-slate-400 mb-2">PRESTANDA-CHECK</div>
                        <code className="block bg-black/20 p-3 rounded text-xs text-green-400 font-mono select-all cursor-pointer">
                            "Analysera 'Tower.tsx' och 'SubtitleOverlay.tsx'. Sker det onödiga omritningar (re-renders)? Används useMemo korrekt?"
                        </code>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded">
                        <div className="text-xs font-bold text-slate-400 mb-2">RACE CONDITIONS</div>
                        <code className="block bg-black/20 p-3 rounded text-xs text-green-400 font-mono select-all cursor-pointer">
                            "Granska 'useGeminiSession'. Finns risk att vi anropar en stängd WebSocket vid snabb PÅ/AV?"
                        </code>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default TowerMaintenance;
