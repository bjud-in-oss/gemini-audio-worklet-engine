
import React from 'react';

const DynamicPersonaInjection: React.FC = () => {
    return (
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-300">
            <h3 className="text-fuchsia-400 font-bold text-sm uppercase tracking-widest mb-3 border-b border-fuchsia-500/30 pb-1 flex items-center gap-2">
                <span className="bg-fuchsia-900/30 text-fuchsia-300 px-2 rounded text-xs border border-fuchsia-500/30">MODUL 48</span>
                Strategi: Dynamic Persona (Total Pressure)
            </h3>

            <div className="bg-slate-900/80 p-5 rounded-xl border border-fuchsia-500/20 text-slate-300 text-sm space-y-8">
                
                <p className="text-sm text-slate-400 leading-relaxed italic">
                    "Persona-mätaren visar serverns attityd."
                    <br/>Detta är inte en teknisk uppspelninghastighet, utan en instruktion om <strong>hur</strong> AI:n ska tala.
                    Systemet mäter nu <strong>Totalt Tryck</strong> (Dam + Jitter) för att avgöra läge.
                </p>

                {/* 1. THE ZONES */}
                <div className="space-y-4">
                    <h4 className="text-white font-bold text-xs uppercase tracking-widest border-l-4 border-fuchsia-500 pl-3">Persona-nivåer</h4>
                    
                    <div className="space-y-2 mt-2">
                        {/* ZONE 1 */}
                        <div className="flex items-center gap-3 bg-slate-950 p-2 rounded border-l-2 border-green-500">
                            <div className="w-16 text-[10px] font-bold text-green-400">NORMAL</div>
                            <div className="flex-1">
                                <strong className="text-white text-xs block">COMFORT MODE (0-15s)</strong>
                                <p className="text-[10px] text-slate-500">Normal samtalston. Full detaljrikedom.</p>
                            </div>
                        </div>

                        {/* ZONE 2 */}
                        <div className="flex items-center gap-3 bg-slate-950 p-2 rounded border-l-2 border-yellow-500">
                            <div className="w-16 text-[10px] font-bold text-yellow-400">FAST</div>
                            <div className="flex-1">
                                <strong className="text-white text-xs block">CATCH-UP MODE (15-25s)</strong>
                                <p className="text-[10px] text-slate-500">"Speak faster. Remove filler words." (Nyhetsuppläsare).</p>
                            </div>
                        </div>

                        {/* ZONE 3 */}
                        <div className="flex items-center gap-3 bg-slate-950 p-2 rounded border-l-2 border-red-500">
                            <div className="w-16 text-[10px] font-bold text-red-400">ROCKET</div>
                            <div className="flex-1">
                                <strong className="text-white text-xs block">ROCKET MODE (&gt;25s)</strong>
                                <p className="text-[10px] text-slate-500">"URGENT. Summarize content. Telegraphic style." (Auktionsförrättare).</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. VISUALIZATION */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <h4 className="text-white font-bold text-xs uppercase tracking-widest border-l-4 border-purple-500 pl-3">UI Representation</h4>
                    <div className="flex gap-4 items-center bg-slate-950 p-4 rounded border border-slate-800">
                        <div className="w-16 h-16 rounded-full border-4 border-fuchsia-500 flex items-center justify-center bg-fuchsia-900/20 shadow-[0_0_15px_rgba(217,70,239,0.4)]">
                            <span className="text-white font-bold font-mono text-xs">ROCKET</span>
                        </div>
                        <div className="flex-1">
                            <strong className="text-fuchsia-400 text-xs block mb-1">Fuchsia Mätare (Persona)</strong>
                            <p className="text-[10px] text-slate-400">
                                Visar vilket "Läge" servern befinner sig i. Detta styrs av det totala bufferttrycket och injiceras osynligt i textprompten.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default DynamicPersonaInjection;
