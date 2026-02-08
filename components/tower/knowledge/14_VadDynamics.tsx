
import React from 'react';

const VadDynamics: React.FC = () => {
    return (
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-1300">
            <h3 className="text-teal-400 font-bold text-sm uppercase tracking-widest mb-3 border-b border-teal-500/30 pb-1 flex items-center gap-2">
                14. Arkitektur: Hydraulisk VAD (Tripp Trapp Trull)
            </h3>

            <div className="bg-slate-900/80 p-5 rounded-xl border border-teal-500/20 text-slate-300 text-sm space-y-6">
                
                <p className="text-sm text-slate-400 leading-relaxed">
                    Implementation v8.0. Systemet styrs nu helt av <strong>trycket</strong> i två riktningar.
                </p>

                {/* LOGIC TABLE */}
                <div className="bg-slate-950 p-4 rounded border border-slate-800 font-mono text-xs space-y-4">
                    <div className="text-teal-300 font-bold border-b border-slate-800 pb-2 text-xs flex justify-between items-center">
                        <span>BESLUTSMATRIS (Vid Sköld-öppning)</span>
                        <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">Trigger: TurnComplete / Timeout</span>
                    </div>
                    
                    {/* SCENARIO 1: ESCALATE */}
                    <div className="grid grid-cols-[20px_1fr] gap-3 opacity-90">
                        <div className="mt-1.5 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                        <div>
                            <div className="flex justify-between mb-1">
                                <strong className="text-white">UPPTRAPPNING (Trull/Monolog)</strong>
                                <span className="text-red-400 font-bold">1200ms - 2000ms</span>
                            </div>
                            <div className="text-slate-500 mb-2 flex flex-col gap-1 bg-slate-900/50 p-2 rounded border border-slate-800">
                                <div className="flex justify-between">
                                    <span>Villkor A (Materia):</span>
                                    <code className="text-blue-300">DAM &gt; 0 (Utgående Buffert)</code>
                                </div>
                                <div className="flex justify-between">
                                    <span>Villkor B (Rörelse):</span>
                                    <code className="text-fuchsia-300">GHOST (Tid &gt; 3s)</code>
                                </div>
                            </div>
                            <div className="text-[10px] text-slate-400 italic leading-relaxed">
                                <p className="mb-1"><strong className="text-slate-300">Utgående Tryck:</strong> Om vi har buffrad data som väntar (DAM), ELLER om du pratat länge (GHOST), måste vi öka toleransen.</p>
                                <span className="text-red-900/80 block mt-1">Effekt: Vi väntar in andningspauser.</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-slate-800/50 w-full"></div>

                    {/* SCENARIO 2: SOFT LANDING */}
                    <div className="grid grid-cols-[20px_1fr] gap-3 opacity-90">
                        <div className="mt-1.5 w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]"></div>
                        <div>
                            <div className="flex justify-between mb-1">
                                <strong className="text-white">MJUKLANDNING (Trapp/Lyssna)</strong>
                                <span className="text-yellow-400 font-bold">HALVERA</span>
                            </div>
                            <div className="text-slate-500 mb-1">
                                Villkor: <code className="text-slate-300">JITTER &gt; 0.1s</code> (Inkommande Tryck)
                            </div>
                            <p className="text-[10px] text-slate-400 italic">
                                Användaren är tyst, men AI:n pratar (Jitter bufferten spelar upp). Vi sänker toleransen stegvis för att tillåta eftertanke utan att bli för aggressiva.
                                <br/><span className="text-yellow-900/80">Ny SIL = max(SIL / 2, BASE_SIL)</span>
                            </p>
                        </div>
                    </div>

                    <div className="h-px bg-slate-800/50 w-full"></div>

                    {/* SCENARIO 3: RESET */}
                    <div className="grid grid-cols-[20px_1fr] gap-3 opacity-90">
                        <div className="mt-1.5 w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                        <div>
                            <div className="flex justify-between mb-1">
                                <strong className="text-white">ÅTERSTÄLLNING (Tripp/Dialog)</strong>
                                <span className="text-green-400 font-bold">BASE_SIL (275ms)</span>
                            </div>
                            <div className="text-slate-500 mb-1">
                                Villkor: <code className="text-slate-300">INGET TRYCK (Varken In eller Ut)</code>
                            </div>
                            <p className="text-[10px] text-slate-400 italic">
                                Total jämvikt. Vi går in i "Ping-Pong"-läge med maximal responsivitet.
                                <br/><span className="text-green-900/80">Ny SIL = 275ms</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* SQUEEZE LOGIC BLOCK */}
                <div className="bg-slate-950 p-4 rounded border border-slate-800 font-mono text-xs space-y-3">
                    <div className="text-rose-300 font-bold border-b border-slate-800 pb-2 text-xs flex justify-between">
                        <span>SÄKERHETSPÄRR: THE SQUEEZE</span>
                        <span className="text-slate-500">Trigger: Taltid &gt; 20s</span>
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                        <div className="text-[10px] text-slate-400 w-2/3">
                            Oavsett vad TTT-logiken säger, tar "The Squeeze" över om en tur varar längre än 20 sekunder. Den tvingar ner toleransen linjärt mot 100ms för att garantera ett avbrott innan Googles 30s-gräns.
                        </div>
                        <div className="w-1/3 h-1 bg-gradient-to-r from-yellow-500 to-red-600 rounded"></div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default VadDynamics;
