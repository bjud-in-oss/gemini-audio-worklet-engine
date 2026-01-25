
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
                    1. Minnesläckage & Resurser
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

            {/* SECTION 2: PERFORMANCE STRATEGY (NEW) */}
            <section>
                <h4 className="text-xs font-bold text-yellow-400 uppercase tracking-widest mb-3 mt-6">
                    2. Prestanda & UI-Konflikter (v6.5)
                </h4>
                <div className="bg-slate-900/50 p-3 rounded text-sm text-slate-400 space-y-3">
                    <p>
                        Vi har infört tung grafik (Karaoke-animering, Fysik-scroll, Karta). Eftersom ljudmotorn (ScriptProcessor) delar tråd med UI:t, skapar detta en konflikt.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-950 p-2 rounded border border-slate-700">
                            <strong className="text-white block mb-1">Problem</strong>
                            Animationer (rAF) blockerar Main Thread &gt; 16ms. Ljudbufferten hinner inte tömmas -&gt; "Klickljud".
                        </div>
                        <div className="bg-slate-950 p-2 rounded border border-slate-700">
                            <strong className="text-green-400 block mb-1">Lösning (Nu)</strong>
                            <span className="text-white font-mono">Buffer = 4096</span>. 
                            Vi ökar bufferten (Latens: ~250ms) för att ge UI:t dubbelt så lång tid att rita mellan ljud-events.
                        </div>
                    </div>

                    <div className="text-xs bg-indigo-900/20 p-2 rounded border border-indigo-500/30 text-indigo-300">
                        <strong>Långsiktig Plan:</strong> Byt till <code>AudioWorklet</code> (se Modul 10 i Kunskapsbanken) för att frikoppla ljudet helt från grafiken.
                    </div>
                </div>
            </section>

            {/* SECTION 3: AI COMMANDS */}
            <section>
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 mt-6">
                    3. Kommandon till Utvecklaren (AI)
                </h4>
                <div className="space-y-4">
                    <div className="bg-slate-900/50 p-3 rounded">
                        <div className="text-xs font-bold text-slate-400 mb-2">PRESTANDA-CHECK</div>
                        <code className="block bg-black/20 p-3 rounded text-xs text-green-400 font-mono select-all">
                            "Analysera 'Tower.tsx' och 'SubtitleOverlay.tsx'. Sker det onödiga omritningar? Vi kör nu Buffer 4096, håller synken?"
                        </code>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default TowerMaintenance;
