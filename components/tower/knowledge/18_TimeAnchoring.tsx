
import React from 'react';

const TimeAnchoring: React.FC = () => {
    return (
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-300">
            <h3 className="text-red-400 font-bold text-sm uppercase tracking-widest mb-3 border-b border-red-500/30 pb-1 flex items-center gap-2">
                18. Diagnos: Tidsankaret (Lookahead)
            </h3>

            <div className="bg-slate-900/80 p-5 rounded-xl border border-red-500/20 text-slate-300 text-sm space-y-6">
                
                <p className="text-sm text-slate-400 leading-relaxed italic">
                    Varför tänds texten innan ljudet hörs? Det handlar om hur hjärnan fungerar.
                </p>

                {/* THE PSYCHO-ACOUSTIC EXPLANATION */}
                <div className="space-y-4">
                    <div className="bg-slate-950 p-4 rounded border-l-4 border-green-500">
                        <strong className="text-green-400 text-xs uppercase block mb-1">Fenomenet: Perceptuell Latens</strong>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Om vi tänder ordet exakt samtidigt som ljudet spelas upp, upplever hjärnan att texten är "sen". Det tar några millisekunder för ögat att registrera ljuset och för hjärnan att läsa ordet.
                        </p>
                    </div>

                    <div className="bg-slate-950 p-4 rounded border border-slate-800">
                        <strong className="text-white text-xs uppercase block mb-2">Lösning: Trumslagaren</strong>
                        <p className="text-xs text-slate-400 leading-relaxed mb-3">
                            Tänk på en trumslagare. Han lyfter pinnen <em>innan</em> han slår på trumman. Vi gör samma sak.
                        </p>
                        <div className="bg-black/40 p-2 rounded font-mono text-center text-xs">
                            <span className="text-slate-500">Animationstiden = </span> 
                            <span className="text-white">Ljudtid</span> 
                            <span className="text-green-400 font-bold"> + 0.05 sekunder</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2 italic">
                            Vi lurar systemet att tro att vi är 50ms längre fram i tiden än vad vi egentligen är. Detta gör att texten tänds precis innan ljudet når örat, vilket skapar en känsla av omedelbarhet ("Snappiness").
                        </p>
                    </div>
                </div>

                {/* DEV SPECS */}
                <div className="mt-4 pt-4 border-t border-slate-800">
                    <strong className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-2">Technical Implementation Specs</strong>
                    <div className="bg-black/30 p-2 rounded text-[10px] font-mono text-slate-400 space-y-1">
                        <p>• <strong>Constant:</strong> <code>LOOKAHEAD_OFFSET = 0.05</code> (50ms).</p>
                        <p>• <strong>Logic:</strong> <code>const elapsed = (now - timing.startTime) + 0.05;</code></p>
                        <p>• <strong>Warning:</strong> Ta inte bort detta! Utan 50ms känns appen "laggig" även om den är matematiskt perfekt.</p>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default TimeAnchoring;
