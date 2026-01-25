
import React from 'react';

const RenderPipeline: React.FC = () => {
    return (
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-100">
            <h3 className="text-violet-400 font-bold text-sm uppercase tracking-widest mb-3 border-b border-violet-500/30 pb-1 flex items-center gap-2">
                16. Grafikmotor: Museet & Dansgolvet
            </h3>

            <div className="bg-slate-900/80 p-5 rounded-xl border border-violet-500/20 text-slate-300 text-sm space-y-6">
                
                <p className="text-sm text-slate-400 leading-relaxed">
                    För att få appen att kännas snabb men ändå minnas allt som sagts, har vi delat upp skärmen i två världar med olika regler.
                </p>

                {/* THE SEPARATION ANALOGY */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-950 p-4 rounded border border-slate-800">
                        <strong className="text-blue-400 text-xs uppercase block mb-2">1. Historiken (Museet)</strong>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Gamla meningar är som tavlor på ett museum. De hänger stilla på väggen. 
                            React (vår byggmästare) ramar in dem en gång och rör dem sedan aldrig mer. 
                            Detta sparar enormt mycket datorkraft.
                        </p>
                    </div>
                    <div className="bg-slate-950 p-4 rounded border border-slate-800">
                        <strong className="text-violet-400 text-xs uppercase block mb-2">2. Aktiv Text (Dansgolvet)</strong>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Den meningen som sägs <em>just nu</em> är på dansgolvet. Här blinkar lamporna (Karaoke-effekten) 60 gånger i sekunden. 
                            Vi använder en specialmotor (rAF) här som är supersnabb, men den får <strong>bara</strong> röra den aktiva raden.
                        </p>
                    </div>
                </div>

                <div className="bg-slate-950/50 p-3 rounded border-l-2 border-green-500 text-xs text-slate-400">
                    <strong className="text-green-400 block mb-1">LÖSNINGEN (Varför historiken syns):</strong>
                    Tidigare försökte vi tvinga in allt på dansgolvet. Då försvann de gamla meningarna när musiken stannade.
                    Nu flyttar vi dem aktivt till "Museet" (<code>history.map</code>) så fort de är färdiga.
                </div>

                {/* DEV SPECS */}
                <div className="mt-4 pt-4 border-t border-slate-800">
                    <strong className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-2">Technical Implementation Specs</strong>
                    <div className="bg-black/30 p-2 rounded text-[10px] font-mono text-slate-400 space-y-1">
                        <p>• <strong>History:</strong> Måste renderas via standard React <code>{'{history.map(...)}'}</code> inuti <code>SubtitleOverlay.tsx</code>.</p>
                        <p>• <strong>Active:</strong> Renderas separat som en enda <code>{'<ActiveItem />'}</code>-komponent.</p>
                        <p>• <strong>Isolation:</strong> <code>useKaraokeAnimation</code> får endast referera till ActiveItems DOM-nod, aldrig parent-containern.</p>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default RenderPipeline;
