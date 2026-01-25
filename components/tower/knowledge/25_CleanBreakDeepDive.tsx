
import React from 'react';

const CleanBreakDeepDive: React.FC = () => {
    return (
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-400">
            <h3 className="text-sky-400 font-bold text-sm uppercase tracking-widest mb-3 border-b border-sky-500/30 pb-1 flex items-center gap-2">
                25. Signalering: The Clean Break Protocol
            </h3>

            <div className="bg-slate-900/80 p-5 rounded-xl border border-sky-500/20 text-slate-300 text-sm space-y-6">
                
                <p className="text-sm text-slate-400 leading-relaxed italic">
                    Att bara sluta skicka ljud räcker inte. Serverns VAD har "tröghet" och kan tro att du bara tar en paus. Vi måste tvinga fram ett avslat.
                </p>

                {/* THE PROTOCOL */}
                <div className="space-y-4">
                    <div className="bg-slate-950 p-4 rounded border border-slate-800">
                        <strong className="text-white text-xs uppercase block mb-3">Sekvensen vid "Turn Complete"</strong>
                        
                        <div className="flex items-center gap-2 text-xs font-mono overflow-x-auto pb-2">
                            {/* STEP 1 */}
                            <div className="flex flex-col items-center min-w-[80px]">
                                <div className="h-8 w-full bg-slate-800 rounded flex items-center justify-center border border-slate-600 text-slate-400 mb-1">
                                    TAL
                                </div>
                                <span className="text-[9px] text-slate-500">User Audio</span>
                            </div>

                            <span className="text-slate-600">→</span>

                            {/* STEP 2: THE BURST */}
                            <div className="flex flex-col items-center min-w-[100px]">
                                <div className="h-8 w-full bg-sky-900/30 rounded flex items-center justify-center border border-sky-500 text-sky-400 font-bold mb-1 animate-pulse">
                                    BURST
                                </div>
                                <span className="text-[9px] text-sky-400">800ms Tystnad</span>
                            </div>

                            <span className="text-slate-600">→</span>

                            {/* STEP 3: THE SIGNAL */}
                            <div className="flex flex-col items-center min-w-[80px]">
                                <div className="h-8 w-full bg-red-900/30 rounded flex items-center justify-center border border-red-500 text-red-400 font-bold mb-1">
                                    SIG
                                </div>
                                <span className="text-[9px] text-red-400">EndTurn</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-950/50 p-3 rounded border border-slate-800">
                            <strong className="text-sky-400 text-xs block mb-1">1. The Pacifier (Burst)</strong>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Vi skickar omedelbart 800ms av <em>absolut digital tystnad</em> (0x00 PCM). Detta spolar rent serverns buffertar och tvingar dess VAD-nivå till noll. Det eliminerar risken att servern tolkar bakgrundsbrus eller "slutet på ett ord" som att du fortsätter prata.
                            </p>
                        </div>
                        <div className="bg-slate-950/50 p-3 rounded border border-slate-800">
                            <strong className="text-red-400 text-xs block mb-1">2. The Terminator (Signal)</strong>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                50ms efter tystnaden skickar vi JSON-kommandot <code>turnComplete: true</code>. Eftersom servern nu är "tystad" av Bursten, accepteras signalen direkt utan fördröjning.
                            </p>
                        </div>
                    </div>
                </div>

                {/* DEV SPECS */}
                <div className="mt-4 pt-4 border-t border-slate-800">
                    <strong className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-2">Technical Implementation Specs</strong>
                    <div className="bg-black/30 p-2 rounded text-[10px] font-mono text-slate-400 space-y-1">
                        <p>• <strong>Const:</strong> <code>SILENCE_BURST_B64</code> (Pre-calculated 800ms buffer).</p>
                        <p>• <strong>Timing:</strong> <code>sendAudio(BURST)</code> → <code>setTimeout(sendEndTurn, 50)</code>.</p>
                        <p>• <strong>Syfte:</strong> Löser "Hängande VAD" där AI:n väntar 500ms extra innan den svarar.</p>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default CleanBreakDeepDive;
