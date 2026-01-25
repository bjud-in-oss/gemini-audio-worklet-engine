
import React from 'react';

const VadHysteresisAnalysis: React.FC = () => {
    return (
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-1000">
            <h3 className="text-orange-400 font-bold text-sm uppercase tracking-widest mb-3 border-b border-orange-500/30 pb-1 flex items-center gap-2">
                11. Idé-labb: Tripp Trapp Trull (Hydraulisk VAD)
            </h3>

            <div className="bg-slate-900/80 p-5 rounded-xl border border-orange-500/20 text-slate-300 text-sm space-y-8">
                
                {/* 1. CONCEPT */}
                <div>
                    <h4 className="text-white font-bold mb-3 flex items-center gap-2 text-sm">
                        <span className="bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded text-xs">HYPOTES</span>
                        Tryckbaserad Tolerans
                    </h4>
                    <p className="text-sm text-slate-400 mb-2">
                        Istället för en fast tid, justerar vi <code>ACTIVE_SIL</code> (Paus-tolerans) baserat på "Trycket" i systemet. Tryck kan komma från <strong>Buffertar</strong> (Data) eller <strong>Momentum</strong> (Tid).
                    </p>
                    <ul className="list-disc list-inside text-sm text-slate-400 space-y-1 ml-1">
                        <li><strong>Trull (Högt Tryck):</strong> Aktiveras om <code>DAM {'>'} 0</code> (Buffert) ELLER <code>Taltid {'>'} 3s</code> (Momentum/Ghost). Ökar toleransen kraftigt för att tillåta monologer.</li>
                        <li><strong>Trapp (Mottryck):</strong> Aktiveras om <code>JITTER {'>'} 0</code> (AI pratar). Sänker toleransen mjukt ("Soft Landing") för att tillåta lyssnande.</li>
                        <li><strong>Tripp (Lågt Tryck):</strong> Inget tryck alls. Återgår till <code>275ms</code> för blixtsnabb ping-pong dialog.</li>
                    </ul>
                </div>

                {/* 2. LOGIC */}
                <div className="bg-slate-950 p-4 rounded border border-slate-800 text-xs font-mono text-slate-400 space-y-2">
                    <p>
                        <strong className="text-white">Tripp (Basläge):</strong> <code>C_SIL</code> (275ms). Standard vid korta kommandon.<br/>
                        <strong className="text-yellow-400">Trapp (Mjuklandning):</strong> <code>C_SIL / 2</code>. När vi lyssnar på AI:n.<br/>
                        <strong className="text-fuchsia-400">Trull (Ghost/Dam):</strong> <code>1200ms - 2000ms</code>. <br/>
                        <span className="pl-4 block text-slate-500">- Om DAM > 0: Maximerar tolerans (bufferten måste tömmas).</span>
                        <span className="pl-4 block text-slate-500">- Om GHOST (Momentum): Sätter 1200ms (Gyllene Medelvägen).</span>
                        <em className="text-slate-500 block mt-2">Detta skapar ett system som "andas" med samtalet och vet skillnad på en paus och ett slut.</em>
                    </p>
                </div>

            </div>
        </section>
    );
};

export default VadHysteresisAnalysis;
