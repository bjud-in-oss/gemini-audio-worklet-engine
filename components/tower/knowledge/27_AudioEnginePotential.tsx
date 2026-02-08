
import React from 'react';

const AudioEnginePotential: React.FC = () => {
    return (
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-500">
            <h3 className="text-indigo-400 font-bold text-sm uppercase tracking-widest mb-3 border-b border-indigo-500/30 pb-1 flex items-center gap-2">
                <span className="bg-green-900/30 text-green-300 px-2 rounded text-xs border border-green-500/30">MODUL 27</span>
                Ljudmotorn: WSOLA (Implementerad)
            </h3>

            <div className="bg-slate-900/80 p-5 rounded-xl border border-indigo-500/20 text-slate-300 text-sm space-y-8">
                
                {/* STATUS UPDATE */}
                <div className="bg-green-900/20 p-3 rounded border border-green-500/30 flex items-center gap-3">
                    <div className="text-lg">✅</div>
                    <div>
                        <strong className="text-green-400 text-xs block">Status: AKTIV I PRODUKTION</strong>
                        <p className="text-[10px] text-slate-300">
                            WSOLA-motorn är nu integrerad i <code>AudioWorklet</code>. Den använder en adaptiv hastighetskontroll som reagerar på bufferttryck utan att påverka tonhöjden (Pitch Preservation).
                        </p>
                    </div>
                </div>

                {/* LOGIC */}
                <div className="space-y-4">
                    <h4 className="text-white font-bold text-xs uppercase tracking-widest border-l-4 border-indigo-500 pl-3">Hastighetslogik (Hybrid Velocity)</h4>
                    
                    <div className="grid grid-cols-1 gap-2">
                        <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between items-center">
                            <span className="text-xs text-slate-400">0 - 5s Latens</span>
                            <span className="text-xs font-bold text-green-400">1.00x (Realtid)</span>
                        </div>
                        <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between items-center">
                            <span className="text-xs text-slate-400">5 - 15s Latens</span>
                            <span className="text-xs font-bold text-blue-400">1.05x - 1.10x (Smygande)</span>
                        </div>
                        <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between items-center">
                            <span className="text-xs text-slate-400">15 - 25s Latens</span>
                            <span className="text-xs font-bold text-amber-400">1.20x (Aggressiv)</span>
                        </div>
                        <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between items-center">
                            <span className="text-xs text-slate-400">&gt; 25s Latens</span>
                            <span className="text-xs font-bold text-red-400">1.30x (Panik)</span>
                        </div>
                    </div>
                </div>

                {/* PERFORMANCE */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <h4 className="text-white font-bold text-xs uppercase tracking-widest border-l-4 border-green-500 pl-3">Prestanda</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Ljudmotorn körs på en isolerad tråd och kan hantera upp till 30 sekunders buffert utan minnesproblem. 
                        Eco Mode stänger automatiskt av processorn vid tystnad för att spara batteri på mobila enheter.
                    </p>
                </div>

            </div>
        </section>
    );
};

export default AudioEnginePotential;
