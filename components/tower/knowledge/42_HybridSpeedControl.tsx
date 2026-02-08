
import React from 'react';

const HybridSpeedControl: React.FC = () => {
    return (
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-300">
            <h3 className="text-purple-400 font-bold text-sm uppercase tracking-widest mb-3 border-b border-purple-500/30 pb-1 flex items-center gap-2">
                <span className="bg-purple-900/30 text-purple-300 px-2 rounded text-xs border border-purple-500/30">MODUL 42</span>
                Tri-Velocity Dashboard: Ekvationen
            </h3>

            <div className="bg-slate-900/80 p-5 rounded-xl border border-purple-500/20 text-slate-300 text-sm space-y-8">
                
                <p className="text-sm text-slate-400 leading-relaxed italic">
                    Total upplevd hastighet är summan av tre oberoende system som samverkar.
                </p>

                {/* 1. THE EQUATION */}
                <div className="bg-slate-950 p-4 rounded border border-slate-800 text-center space-y-3">
                    <strong className="text-white text-xs uppercase tracking-widest">Master-Ekvationen</strong>
                    <div className="bg-black/40 p-3 rounded font-mono text-xs md:text-sm text-green-400 border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                        TOTAL_SPEED = PERSONA * WSOLA * LERP
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-500 font-mono mt-2">
                        <div className="flex flex-col items-center">
                            <span className="text-fuchsia-400 font-bold">1.20x</span>
                            <span>(Densitet)</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-cyan-400 font-bold">1.30x</span>
                            <span>(Tid)</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-green-400 font-bold">1.02x</span>
                            <span>(Pitch)</span>
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-400 italic">
                        Exempel vid extrem belastning: 1.2 * 1.3 * 1.02 ≈ <strong>1.59x</strong> realtid.
                    </p>
                </div>

                {/* 2. THE THREE LAYERS */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <h4 className="text-white font-bold text-xs uppercase tracking-widest border-l-4 border-purple-500 pl-3">De tre lagren</h4>
                    
                    <div className="grid grid-cols-1 gap-3">
                        {/* PERSONA */}
                        <div className="bg-slate-950 p-3 rounded border-l-2 border-fuchsia-500 flex gap-3 items-start">
                            <div className="text-fuchsia-400 font-bold text-xs pt-0.5">1.</div>
                            <div>
                                <strong className="text-fuchsia-300 text-xs uppercase block">Persona (Reporter-läget)</strong>
                                <p className="text-[10px] text-slate-400 leading-relaxed">
                                    "Tala som en nyhetsuppläsare". 
                                    Detta handlar inte om att spela upp ljudet snabbare, utan om att AI:n <strong>minskar pauserna mellan ord</strong>. 
                                    Detta ökar informationstätheten (ord per sekund) naturligt.
                                </p>
                            </div>
                        </div>

                        {/* WSOLA */}
                        <div className="bg-slate-950 p-3 rounded border-l-2 border-cyan-500 flex gap-3 items-start">
                            <div className="text-cyan-400 font-bold text-xs pt-0.5">2.</div>
                            <div>
                                <strong className="text-cyan-300 text-xs uppercase block">WSOLA (Tidskompression)</strong>
                                <p className="text-[10px] text-slate-400 leading-relaxed">
                                    Klipper bort små bitar av ljudet för att korta ner det <em>utan</em> att rösten blir ljus (Kalle Anka). 
                                    Detta är vår arbetshäst för att jobba ikapp latens mellan 2-10 sekunder.
                                </p>
                            </div>
                        </div>

                        {/* LERP */}
                        <div className="bg-slate-950 p-3 rounded border-l-2 border-green-500 flex gap-3 items-start">
                            <div className="text-green-400 font-bold text-xs pt-0.5">3.</div>
                            <div>
                                <strong className="text-green-300 text-xs uppercase block">Lerp (Smoothing)</strong>
                                <p className="text-[10px] text-slate-400 leading-relaxed">
                                    <strong>Alltid aktiv.</strong> Börjar på 0% (1.00x) vid tom buffert. 
                                    Ökar gradvis till max 2% (1.02x) när bufferten når 15 sekunder.
                                    Fungerar som en "stötdämpare" för att undvika hack i ljudet vid hastighetsförändringar.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default HybridSpeedControl;
