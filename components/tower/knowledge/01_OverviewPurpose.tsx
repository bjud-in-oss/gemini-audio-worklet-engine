
import React from 'react';

const OverviewPurpose: React.FC = () => {
    return (
        <section className="mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h3 className="text-indigo-400 font-bold text-sm uppercase tracking-widest mb-3 border-b border-indigo-500/30 pb-1 flex items-center gap-2">
                1. Systemets Funktionella Flöde (Testperspektiv)
            </h3>
            <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 space-y-4">
                <p className="text-sm leading-relaxed text-slate-300 italic">
                    "Detta är en <strong>Signalkedja</strong>. Ljudet flödar från mikrofon, genom VAD, in i Bufferten, och stoppas sedan av Skölden tills kusten är klar."
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    
                    {/* FAS 1: INPUT */}
                    <div className="bg-slate-950 p-3 rounded border-l-2 border-green-500">
                        <strong className="text-green-400 text-xs uppercase block mb-1">1. VAD & Input</strong>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Ljudet passerar först <code>VAD</code> (Voice Activity Detection). 
                            Om <code>VAD &gt; THR</code> flaggas det som tal (<code>SPK</code>).
                            <br/><em>Test:</em> Lyser SPK när du pratar? Om inte, sänk C_THR.
                        </p>
                    </div>

                    {/* FAS 2: TRANSPORT */}
                    <div className="bg-slate-950 p-3 rounded border-l-2 border-blue-500">
                        <strong className="text-blue-400 text-xs uppercase block mb-1">2. Buffert & Dam</strong>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Godkänt ljud hamnar i <code>DAM</code> (The Dam) om skölden är uppe.
                            <br/><em>TTT-Logik:</em> Om DAM fylls (högt tryck), vet systemet att du håller en monolog och ökar tystnadstoleransen (Trull-läge) för att inte avbryta.
                        </p>
                    </div>

                    {/* FAS 3: LOGIK */}
                    <div className="bg-slate-950 p-3 rounded border-l-2 border-purple-500">
                        <strong className="text-purple-400 text-xs uppercase block mb-1">3. The Shield (SHLD)</strong>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Skölden skyddar mot avbrott. Den styrs av en <strong>Hybrid-Prediktion</strong>:
                            <br/>1. Olinjär gissning (vid tystnad).
                            <br/>2. Rullande säkerhetsmarginal (när AI svarar).
                            <br/>3. Direkt avslut (vid TurnComplete).
                        </p>
                    </div>

                    {/* FAS 4: DIAGNOS */}
                    <div className="bg-slate-950 p-3 rounded border-l-2 border-red-500">
                        <strong className="text-red-400 text-xs uppercase block mb-1">4. Utgång & Nätverk</strong>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            När skölden faller, skickas allt uppdämt ljud i <code>DAM</code> som en "Burst" via <code>TX</code> till Google.
                            Svaret kommer tillbaka via <code>RX</code>.
                        </p>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default OverviewPurpose;
