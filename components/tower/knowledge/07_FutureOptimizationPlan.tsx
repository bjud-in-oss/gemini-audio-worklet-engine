
import React from 'react';

const FutureOptimizationPlan: React.FC = () => {
    return (
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-600">
            <h3 className="text-cyan-400 font-bold text-sm uppercase tracking-widest mb-3 border-b border-cyan-500/30 pb-1">
                7. Åtgärdsplan & Kritisk Analys
            </h3>

            <div className="bg-slate-900/80 p-5 rounded-xl border border-cyan-500/20 text-slate-300 text-sm">
                <div className="space-y-8">
                    
                    {/* PLAN 3 UPDATE */}
                    <div className="space-y-3">
                        <div className="flex gap-2 items-center">
                            <div className="text-cyan-400 font-bold text-xs border border-cyan-500/30 px-2 py-0.5 rounded bg-cyan-900/30">PLAN C</div>
                            <strong className="text-white text-sm">Prompt-Styrning (Waiting Strategy)</strong>
                        </div>
                        <p className="text-xs text-slate-400 ml-1">
                            <strong>Teori:</strong> Beordra Gemini via systeminstruktionen att ignorera korta pauser.
                        </p>
                        
                        <div className="ml-2 pl-4 border-l border-green-500/30 space-y-3">
                            <div>
                                <strong className="text-red-400 text-xs uppercase tracking-wide">Analys:</strong>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Geminis interna VAD styrs inte direkt av prompten (det är en separat modul på servern). 
                                    Men vi kan instruera den att "hålla ut" eller använda fillers ("Hmm...", "Låt mig se...") innan den ger det riktiga svaret. 
                                    Detta köper oss tid om användaren råkar göra en kort paus och minskar känslan av krock.
                                </p>
                            </div>
                            <div className="bg-green-950/30 p-3 rounded border border-green-500/10">
                                <strong className="text-green-300 text-xs">SLUTSATS:</strong>
                                <span className="text-xs text-slate-400"> Värt att utforska för att minska upplevd Barge-in.</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default FutureOptimizationPlan;
