
import React from 'react';

const TheStuckCounter: React.FC = () => {
    return (
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-300">
            <h3 className="text-lime-400 font-bold text-sm uppercase tracking-widest mb-3 border-b border-lime-500/30 pb-1 flex items-center gap-2">
                24. Lösning: Nummerlappen
            </h3>

            <div className="bg-slate-900/80 p-5 rounded-xl border border-lime-500/20 text-slate-300 text-sm space-y-6">
                
                <p className="text-sm text-slate-400 leading-relaxed italic">
                    Varför fastnade texten på första meningen tidigare? Det handlade om ID-nummer.
                </p>

                {/* THE MECHANISM */}
                <div className="grid grid-cols-1 gap-4">
                    <div className="bg-slate-950 p-4 rounded border border-slate-800">
                        <strong className="text-red-400 text-xs uppercase block mb-1">Problemet: "Kund Nummer 1"</strong>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            Tidigare gav vi aldrig ut nya nummerlappar. Systemet trodde att allt du sa under 20 minuter var en enda lång beställning från "Kund 1". 
                            Därför bytte den aldrig rad, den bara suddade och skrev nytt på rad 1.
                        </p>
                    </div>
                    <div className="bg-slate-950 p-4 rounded border border-lime-500 shadow-[0_0_15px_rgba(132,204,22,0.1)]">
                        <strong className="text-lime-400 text-xs uppercase block mb-1">Lösningen: "Ny Kund, Tack!"</strong>
                        <p className="text-xs text-slate-300 leading-relaxed">
                            Nu tvingar vi fram en ny nummerlapp (<code>counter++</code>) varje gång du tar en paus och börjar prata igen.
                            <br/><br/>
                            <strong>Resultat:</strong>
                            <br/>1. "Kund 1" (din förra mening) skickas till arkivet (Historik).
                            <br/>2. Skärmen töms och görs redo för "Kund 2" (din nya mening).
                            <br/>3. Detta skapar den flödande listan.
                        </p>
                    </div>
                </div>

                {/* DEV SPECS */}
                <div className="mt-4 pt-4 border-t border-slate-800">
                    <strong className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-2">Technical Implementation Specs</strong>
                    <div className="bg-black/30 p-2 rounded text-[10px] font-mono text-slate-400 space-y-1">
                        <p>• <strong>Local Generation:</strong> Vi genererar ID lokalt i <code>handlePhraseDetected</code>. Vi litar INTE på serverns IDs.</p>
                        <p>• <strong>Locking:</strong> <code>responseGroupIdRef</code> används för att låsa ett inkommande svar till den fras (nummerlapp) som var aktiv när svaret började komma.</p>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default TheStuckCounter;
