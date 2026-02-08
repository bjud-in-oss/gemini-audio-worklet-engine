
import React from 'react';

const WakeUpProtocol: React.FC = () => {
    return (
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-500">
            <h3 className="text-sky-400 font-bold text-sm uppercase tracking-widest mb-3 border-b border-sky-500/30 pb-1 flex items-center gap-2">
                <span className="bg-sky-900/30 text-sky-300 px-2 rounded text-xs border border-sky-500/30">MODUL 47</span>
                Strategi: The Wake-Up Protocol
            </h3>

            <div className="bg-slate-900/80 p-5 rounded-xl border border-sky-500/20 text-slate-300 text-sm space-y-8">
                
                <p className="text-sm text-slate-400 leading-relaxed italic">
                    "Jag började först med att väcka AIn som hörde och översatte mig... Sen när systemet var återställt började jag från början."
                </p>

                {/* 1. THE COLD START PROBLEM */}
                <div className="space-y-4">
                    <h4 className="text-white font-bold text-xs uppercase tracking-widest border-l-4 border-blue-500 pl-3">Problemet: Kallstart</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        När en ny session kopplas upp sker flera saker i bakgrunden:
                        <br/>1. WebSocket handskakning.
                        <br/>2. VAD-modellen "värms upp".
                        <br/>3. Servern allokerar kontext-minne.
                        <br/><br/>
                        Om man börjar läsa en tung text (som Mosiah 5) millisekunden efter anslutning, är risken för paketförlust eller "hallucination" hög.
                    </p>
                </div>

                {/* 2. THE MANUAL HANDSHAKE */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <h4 className="text-emerald-400 font-bold text-xs uppercase tracking-widest border-l-4 border-emerald-500 pl-3">Lösningen: Manuell Handskakning</h4>
                    
                    <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-3">
                        <strong className="text-white text-xs block">"Are you awake?"</strong>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Genom att ställa en enkel fråga innan den riktiga sessionen börjar, uppnår vi tre saker:
                        </p>
                        <ul className="list-disc list-inside text-xs text-slate-400 space-y-1 ml-1">
                            <li><strong className="text-emerald-400">RTT-kalibrering:</strong> Systemet får mäta responstiden en gång och ställa in BSY-timern korrekt.</li>
                            <li><strong className="text-emerald-400">Audio Warmup:</strong> Ljudmotorn (AudioContext) tvingas igång från "Suspended" läge.</li>
                            <li><strong className="text-emerald-400">Context Prime:</strong> AI:n går in i "Lyssna-läge".</li>
                        </ul>
                    </div>
                </div>

                {/* 3. FUTURE AUTOMATION */}
                <div className="mt-4 p-3 bg-indigo-900/20 rounded border border-indigo-500/30 flex items-start gap-3">
                    <div className="text-xl mt-1">🤖</div>
                    <div>
                        <strong className="text-indigo-300 text-xs block mb-1">Framtida Automatisering</strong>
                        <p className="text-[10px] text-slate-300 leading-relaxed">
                            Vi planerar att bygga in en <strong>Silent Ping</strong>. 
                            Vid anslutning skickar appen automatiskt en osynlig text: <em>"[SYSTEM_INIT]"</em>. 
                            AI:n svarar med en tyst signal. Först därefter tänds den gröna "Klar"-lampan för användaren.
                        </p>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default WakeUpProtocol;
