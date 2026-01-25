
import React from 'react';

const VisualHandover: React.FC = () => {
    return (
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-200">
            <h3 className="text-emerald-400 font-bold text-sm uppercase tracking-widest mb-3 border-b border-emerald-500/30 pb-1 flex items-center gap-2">
                21. Överlämning: Det Osynliga Transportbandet
            </h3>

            <div className="bg-slate-900/80 p-5 rounded-xl border border-emerald-500/20 text-slate-300 text-sm space-y-6">
                
                <p className="text-sm text-slate-400 leading-relaxed">
                    Det svåraste ögonblicket är när en mening är klar och en ny börjar. Det får inte "hoppa" till. Vi löste det genom att efterlikna en teleprompter.
                </p>

                {/* THE CONVEYOR BELT */}
                <div className="relative pl-6 border-l-2 border-slate-700 space-y-4">
                    <div className="absolute -left-[29px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900"></div>
                    
                    <div>
                        <strong className="text-white text-xs block mb-1">1. "Gråa Ut" (Opacity)</strong>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            När en mening blir historik, tar vi inte bort den. Vi sänker bara belysningen (<code>opacity: 0.5</code>). 
                            Det signalerar till hjärnan att "den här är klar, men du kan fortfarande läsa den om du vill".
                        </p>
                    </div>

                    <div>
                        <strong className="text-white text-xs block mb-1">2. Mjukt Glid (Fysikmotorn)</strong>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            När en ny mening dyker upp, scrollar vi inte direkt. Vi knuffar hela listan mjukt uppåt.
                            Vår <code>useScrollPhysics</code> fungerar som stötdämpare på en bil. Även om datan kommer i ryckiga paket, blir rörelsen på skärmen mjuk.
                        </p>
                    </div>
                </div>

                <div className="bg-slate-950/50 p-3 rounded border border-emerald-500/30 mt-2">
                    <strong className="text-emerald-300 text-xs block mb-1">Resultat:</strong>
                    <p className="text-xs text-slate-400">
                        Användaren upplever det inte som att text "byts ut", utan som att man färdas framåt längs ett oändligt pappersark.
                    </p>
                </div>

                {/* DEV SPECS */}
                <div className="mt-4 pt-4 border-t border-slate-800">
                    <strong className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-2">Technical Implementation Specs</strong>
                    <div className="bg-black/30 p-2 rounded text-[10px] font-mono text-slate-400 space-y-1">
                        <p>• <strong>Hook:</strong> <code>useScrollPhysics</code>.</p>
                        <p>• <strong>Trigger:</strong> Måste triggas av <code>activeGroup?.id</code>. När ID byts, omvärderas målet (Target).</p>
                        <p>• <strong>Physics:</strong> Spring Tension: 120, Friction: 20.</p>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default VisualHandover;
