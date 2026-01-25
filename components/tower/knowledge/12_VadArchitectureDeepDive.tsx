
import React from 'react';

const VadArchitectureDeepDive: React.FC = () => {
    return (
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-1100">
            <h3 className="text-cyan-400 font-bold text-sm uppercase tracking-widest mb-3 border-b border-cyan-500/30 pb-1 flex items-center gap-2">
                12. Systemanatomi: De Tre VAD-Lagren
            </h3>

            <div className="bg-slate-900/80 p-5 rounded-xl border border-cyan-500/20 text-slate-300 text-sm space-y-8">
                
                {/* LAYER 1: PHYSICS */}
                <div className="relative pl-6 border-l-2 border-slate-700">
                    <div className="absolute -left-[29px] top-0 w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] border-2 border-slate-900"></div>
                    <h4 className="text-blue-400 font-bold text-xs uppercase tracking-widest mb-1">LAGER 1: FYSIK (RMS)</h4>
                    <strong className="text-white block mb-1 text-sm">"Finns det energi?"</strong>
                    <p className="text-xs text-slate-400 mb-2">
                        Noise Gate. Filtrerar bort digital tystnad. (0.002)
                    </p>
                </div>

                {/* LAYER 2: INTELLIGENCE */}
                <div className="relative pl-6 border-l-2 border-slate-700">
                    <div className="absolute -left-[29px] top-0 w-4 h-4 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)] border-2 border-slate-900"></div>
                    <h4 className="text-purple-400 font-bold text-xs uppercase tracking-widest mb-1">LAGER 2: INTELLIGENS (NEURAL)</h4>
                    <strong className="text-white block mb-1 text-sm">"Är det mänskligt?"</strong>
                    <p className="text-xs text-slate-400 mb-2">
                        ONNX Silero Model. Avgör om ljudet är tal.
                    </p>
                </div>

                {/* LAYER 3: TEMPORAL LOGIC */}
                <div className="relative pl-6 border-l-2 border-slate-700">
                    <div className="absolute -left-[29px] top-0 w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] border-2 border-slate-900"></div>
                    <h4 className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-1">LAGER 3: TID (TRIPP TRAPP TRULL)</h4>
                    <strong className="text-white block mb-1 text-sm">"Är meningen slut?"</strong>
                    <p className="text-xs text-slate-400 mb-2">
                        Här bor "Hydrauliken". Toleransen <code>ACTIVE_SIL</code> justeras dynamiskt baserat på bufferttryck (DAM/JITTER). 
                        I monologer ökar den. Vid 20-30s aktiveras "The Squeeze" för att tvinga fram ett slut.
                    </p>
                </div>

            </div>
        </section>
    );
};

export default VadArchitectureDeepDive;
