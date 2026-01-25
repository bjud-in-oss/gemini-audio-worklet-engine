
import React from 'react';

const ScenarioAnalysis: React.FC = () => {
    return (
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-1200">
            <h3 className="text-yellow-400 font-bold text-sm uppercase tracking-widest mb-3 border-b border-yellow-500/30 pb-1 flex items-center gap-2">
                13. Meta-Analys: Två Scenarier
            </h3>

            <div className="bg-slate-900/80 p-5 rounded-xl border border-yellow-500/20 text-slate-300 text-sm space-y-6">
                
                <p className="text-sm text-slate-400 leading-relaxed italic">
                    Hur beter sig arkitekturen i verkligheten? Vi ställer två extremer mot varandra. 
                    I centrum står parametern <strong className="text-yellow-400">SIL (Silence Timer)</strong> och hur vi justerar toleransen dynamiskt.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* SCENARIO A */}
                    <div className="bg-slate-950 p-4 rounded border-l-2 border-green-500 flex flex-col h-full">
                        <h4 className="text-green-400 font-bold text-xs uppercase mb-2">Scenario A: Det Lilla Mötet</h4>
                        <ul className="space-y-3 text-xs text-slate-400 flex-1">
                            <li><strong>Miljö:</strong> Fikarum, snabb dialog.</li>
                            <li><strong>Dynamik:</strong> Korta meningar, snabba kast.</li>
                            <li><strong>Logik:</strong>
                                <br/>
                                • <code>BASE_SIL</code>: <strong>200ms</strong>. Extremt aggressivt (Tripp). Vi prioriterar hastighet.
                                <br/>
                                • <code>JIT == 0</code>: Eftersom dialogen är kort, töms jitterbufferten snabbt. Vi återgår nästan direkt till 200ms-läget ("Hard Reset").
                            </li>
                            <li className="text-green-300 font-bold mt-auto pt-2 text-sm">Slutsats: Maximerad responsivitet.</li>
                        </ul>
                    </div>

                    {/* SCENARIO B */}
                    <div className="bg-slate-950 p-4 rounded border-l-2 border-indigo-500 flex flex-col h-full">
                        <h4 className="text-indigo-400 font-bold text-xs uppercase mb-2">Scenario B: Monologen</h4>
                        <ul className="space-y-3 text-xs text-slate-400 flex-1">
                            <li><strong>Miljö:</strong> Predikan, föreläsning (20 min+).</li>
                            <li><strong>Dynamik:</strong> Flytande tal utan tydliga pauser.</li>
                            <li><strong>Logik:</strong>
                                <br/>
                                • <code>DAM {'>'} 0</code>: Bufferten fylls ständigt på. Logiken "Trapp/Trull" ökar toleransen till 1000-2000ms.
                                <br/>
                                • <code>Soft Landing</code>: När talaren väl pausar, och AI:n svarar, halveras toleransen istället för att krascha till 200ms. Detta ger talaren "tveksamhets-utrymme" att fortsätta.
                            </li>
                            <li className="text-indigo-300 font-bold mt-auto pt-2 text-sm">Slutsats: Adaptiv stabilitet.</li>
                        </ul>
                    </div>
                </div>

                {/* META CONNECTIONS */}
                <div className="pt-4 border-t border-slate-800 space-y-3">
                    <h4 className="text-indigo-400 font-bold text-xs uppercase">Kopplingar till Modul 14 (Hydraulisk VAD)</h4>
                    
                    <div className="bg-slate-950 p-3 rounded border border-slate-800 text-xs text-slate-400">
                        <strong className="text-white block mb-1">JITTER_PRESSURE</strong>
                        Mängden ljud som spelas upp just nu fungerar som en "stötdämpare". 
                        Om JITTER {'>'} 0 tillåter vi talaren att vara tystare/långsammare (genom Soft Reset) eftersom vi vet att de lyssnar på översättningen.
                    </div>
                </div>

            </div>
        </section>
    );
};

export default ScenarioAnalysis;
