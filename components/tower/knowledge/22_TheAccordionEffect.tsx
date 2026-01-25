
import React from 'react';

const TheAccordionEffect: React.FC = () => {
    return (
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-100">
            <h3 className="text-rose-400 font-bold text-sm uppercase tracking-widest mb-3 border-b border-rose-500/30 pb-1 flex items-center gap-2">
                22. Fenomen: Dragspelet (Audio vs Text)
            </h3>

            <div className="bg-slate-900/80 p-5 rounded-xl border border-rose-500/20 text-slate-300 text-sm space-y-6">
                
                <p className="text-sm text-slate-400 leading-relaxed">
                    Ett kvarstående fenomen är att texten och ljudet rör sig på olika sätt, som ett dragspel som dras ut och trycks ihop.
                </p>

                {/* THE MECHANISM */}
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-950 p-3 rounded border border-slate-800">
                            <strong className="text-blue-400 text-xs block mb-1">Ljudet (Linjärt)</strong>
                            <p className="text-[10px] text-slate-500">
                                Ljudet strömmar konstant som vatten ur en kran. 1 sekund är alltid 1 sekund. Det är vår "Sanna Tid".
                            </p>
                        </div>
                        <div className="bg-slate-950 p-3 rounded border border-slate-800">
                            <strong className="text-rose-400 text-xs block mb-1">Texten (Ryckig)</strong>
                            <p className="text-[10px] text-slate-500">
                                Texten kommer i klumpar ("Chunks"). Ibland kommer 3 ord, sen tystnad, sen 10 ord på en gång.
                            </p>
                        </div>
                    </div>

                    <div className="bg-slate-950 p-4 rounded border-l-4 border-yellow-500">
                        <strong className="text-yellow-400 text-xs uppercase block mb-1">Konsekvens</strong>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Ibland har vi mer ljud än text (markören stannar upp). Ibland har vi mer text än ljud (markören rusar iväg).
                            <br/><br/>
                            Vår <strong>Hink-logik (Modul 17)</strong> löser detta genom att ständigt räkna om "hur mycket text har vi <em>just nu</em> kontra hur mycket ljud som spelats". Det gör att dragspelet andas mjukt istället för att hacka.
                        </p>
                    </div>
                </div>

                {/* DEV SPECS */}
                <div className="mt-4 pt-4 border-t border-slate-800">
                    <strong className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-2">Technical Implementation Specs</strong>
                    <div className="bg-black/30 p-2 rounded text-[10px] font-mono text-slate-400 space-y-1">
                        <p>• <strong>Fallback:</strong> <code>effectiveDuration = Math.max(audioDuration, estimatedTextNeeded)</code></p>
                        <p>• <strong>Syfte:</strong> Om vi har 5 sekunder text men bara 2 sekunder ljud, får animationen INTE ta 2 sekunder (då blir det oläsligt snabbt). Vi tvingar den att ta den tid texten behöver (5s), även om ljudet tar slut.</p>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default TheAccordionEffect;
