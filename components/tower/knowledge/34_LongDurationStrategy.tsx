
import React from 'react';

const LongDurationStrategy: React.FC = () => {
    return (
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-200">
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-3 border-b border-white/20 pb-1 flex items-center gap-2">
                <span className="bg-white text-black px-2 rounded text-xs">MODUL 34</span>
                Sermon Mode: 20-Minuters-Strategin
            </h3>

            <div className="bg-slate-900/80 p-5 rounded-xl border border-white/10 text-slate-300 text-sm space-y-8">
                
                <p className="text-sm text-slate-400 leading-relaxed italic">
                    "Kan jag prata i 20 minuter utan paus?"
                    <br/>Svaret är tekniskt sett <strong>Nej</strong> (servern gör timeout), men praktiskt sett <strong>Ja</strong> (om vi fuskar).
                </p>

                {/* THE PROBLEM */}
                <div className="space-y-4">
                    <h4 className="text-red-400 font-bold text-xs uppercase tracking-widest border-l-4 border-red-500 pl-3">Begränsningen</h4>
                    <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2">
                        <p className="text-xs text-slate-400">
                            Gemini Live är en <em>Turn-based</em> modell. Den förväntar sig:
                            <br/><code>Lyssna → Tänk → Svara.</code>
                        </p>
                        <p className="text-xs text-slate-400">
                            Om den tvingas lyssna i 20 minuter utan att få svara ("Turn Complete"), fylls dess <strong>Input Buffer</strong> upp. Till slut klipper servern anslutningen för att skydda sig mot minnesläckage.
                        </p>
                    </div>
                </div>

                {/* THE SOLUTION */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <h4 className="text-emerald-400 font-bold text-xs uppercase tracking-widest border-l-4 border-emerald-500 pl-3">Lösningen: "Invisible Segmentation"</h4>
                    
                    <div className="bg-emerald-900/10 p-4 rounded border border-emerald-500/20 space-y-3">
                        <strong className="text-emerald-300 text-xs block">Vi lurar systemet</strong>
                        <p className="text-xs text-slate-300 leading-relaxed">
                            Appen har en inbyggd säkerhetsspärr i <code>useAudioInput.ts</code>.
                        </p>
                        <div className="bg-black/40 p-2 rounded font-mono text-[10px] text-green-400 border border-white/10">
                            if (speechDuration &gt; 25.0s) &#123;<br/>
                            &nbsp;&nbsp;flushTurn(); // Tvinga iväg ljudet<br/>
                            &#125;
                        </div>
                        <ul className="list-disc list-inside text-xs text-slate-400 space-y-2 mt-2">
                            <li>
                                <strong>Micro-Turns:</strong> Även om talaren (prästen) pratar oavbrutet, klipper appen ljudet i bitar om max 25 sekunder.
                            </li>
                            <li>
                                <strong>Context Window:</strong> Eftersom Gemini har ett "minne" (Context), kommer den ihåg vad som sades i förra klippet. Den kan därför fortsätta en mening grammatiskt korrekt även om vi klippte den mitt i ett ord.
                            </li>
                            <li>
                                <strong>Resultat:</strong> För användaren ser det ut som en oändlig ström. För servern ser det ut som en väldigt snabb konversation.
                            </li>
                        </ul>
                    </div>
                </div>

                {/* VISUAL FEEDBACK */}
                <div className="mt-4 p-3 bg-indigo-900/20 rounded border border-indigo-500/30 flex items-center gap-3">
                    <div className="text-2xl">⏳</div>
                    <div className="text-xs text-indigo-200">
                        <strong>Tips:</strong> Om du ser att texten "hackar till" var 25:e sekund, är det detta skyddssystem som arbetar. Det är priset vi betalar för oändlig transkribering.
                    </div>
                </div>

            </div>
        </section>
    );
};

export default LongDurationStrategy;
