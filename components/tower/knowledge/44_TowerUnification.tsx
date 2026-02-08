
import React from 'react';

const TowerUnification: React.FC = () => {
    return (
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-500">
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-3 border-b border-white/20 pb-1 flex items-center gap-2">
                <span className="bg-white text-black px-2 rounded text-xs">MODUL 44</span>
                UI: Tower Unification
            </h3>

            <div className="bg-slate-900/80 p-5 rounded-xl border border-white/10 text-slate-300 text-sm space-y-8">
                
                {/* 1. THE MERGE */}
                <div className="space-y-4">
                    <h4 className="text-teal-400 font-bold text-xs uppercase tracking-widest border-l-4 border-teal-500 pl-3">Sammanslagningen</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Tidigare hade vi två inställningsmenyer: <code>SettingsModal</code> (för användaren) och <code>Tower</code> (för utvecklaren).
                        Detta skapade förvirring och dubbel kod.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="bg-red-900/10 p-3 rounded border border-red-500/20 opacity-60">
                            <strong className="text-red-400 text-xs block mb-1">Gammal Design</strong>
                            <p className="text-[10px] text-slate-500">
                                Två knappar. Två modals. Ofta motstridiga inställningar.
                            </p>
                        </div>
                        <div className="bg-green-900/10 p-3 rounded border border-green-500/20">
                            <strong className="text-green-400 text-xs block mb-1">Ny Design (Unified)</strong>
                            <p className="text-[10px] text-slate-400">
                                En knapp (Kugghjulet). Öppnar alltid Tower i "User Mode". Avancerade funktioner finns kvar men är integrerade.
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. COMPONENT CLEANUP */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <h4 className="text-indigo-400 font-bold text-xs uppercase tracking-widest border-l-4 border-indigo-500 pl-3">Komponent-sanering</h4>
                    <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2">
                        <ul className="list-disc list-inside text-xs text-slate-400">
                            <li>Raderade <code>components/SettingsModal.tsx</code>.</li>
                            <li>Flyttade <code>AudioLayer</code> logik till props (från App.tsx) för att undvika dubbla ljudmotorer.</li>
                            <li>Lade till <code>JitterSimulator</code> och <code>BufferVisualizer</code> direkt i Audio-modulen i Tower.</li>
                        </ul>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default TowerUnification;
