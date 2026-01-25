
import React from 'react';

const CodeArchaeology: React.FC = () => {
    return (
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-200">
            <h3 className="text-teal-400 font-bold text-sm uppercase tracking-widest mb-3 border-b border-teal-500/30 pb-1 flex items-center gap-2">
                23. Kod-Arkeologi: Husets Grundstenar
            </h3>

            <div className="bg-slate-900/80 p-5 rounded-xl border border-teal-500/20 text-slate-300 text-sm space-y-6">
                
                <p className="text-sm text-slate-400 leading-relaxed">
                    I programkod finns det ibland rader som ser onödiga ut, men om man tar bort dem rasar taket in. Här är två sådana "bärande väggar" i vår app.
                </p>

                {/* THE RENDER LOOP */}
                <div className="relative pl-6 border-l-2 border-slate-700 space-y-2">
                    <div className="absolute -left-[29px] top-0 w-4 h-4 rounded-full bg-blue-500 border-2 border-slate-900"></div>
                    <strong className="text-blue-300 text-xs uppercase block">1. Historik-Loopen (Bokhyllan)</strong>
                    <p className="text-xs text-slate-500 font-mono mb-1">Fil: components/SubtitleOverlay.tsx</p>
                    <div className="bg-slate-950 p-3 rounded border border-slate-800 font-mono text-[10px] text-slate-300 overflow-x-auto">
                        <span className="text-slate-500">// Utan denna rad har vi ingenstans att ställa de lästa böckerna</span><br/>
                        &#123;history.map((item) =&gt; (<br/>
                        &nbsp;&nbsp;&lt;HistoryItem text=&#123;item.text&#125; /&gt;<br/>
                        ))&#125;
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                        <strong>Risk:</strong> Om någon tar bort denna loop för att "städa", kommer appen bara visa en rad åt gången.
                    </p>
                </div>

                {/* THE COUNTER */}
                <div className="relative pl-6 border-l-2 border-slate-700 space-y-2">
                    <div className="absolute -left-[29px] top-0 w-4 h-4 rounded-full bg-purple-500 border-2 border-slate-900"></div>
                    <strong className="text-purple-300 text-xs uppercase block">2. Bladvändaren (Phrase Counter)</strong>
                    <p className="text-xs text-slate-500 font-mono mb-1">Fil: hooks/useGeminiLive.ts</p>
                    <div className="bg-slate-950 p-3 rounded border border-slate-800 font-mono text-[10px] text-slate-300 overflow-x-auto">
                        <span className="text-slate-500">// Tvingar systemet att byta blad</span><br/>
                        handlePhraseDetected = (...) =&gt; &#123;<br/>
                        &nbsp;&nbsp;<span className="text-green-400">phraseCounterRef.current += 1;</span><br/>
                        &#125;
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                        <strong>Risk:</strong> Utan denna skriver vi över samma sida om och om igen. Texten uppdateras men flyttas aldrig till historiken.
                    </p>
                </div>

                {/* DEV SPECS */}
                <div className="mt-4 pt-4 border-t border-slate-800">
                    <strong className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-2">Technical Implementation Specs</strong>
                    <div className="bg-black/30 p-2 rounded text-[10px] font-mono text-slate-400 space-y-1">
                        <p>• <strong>Phrase ID:</strong> Måste vara ett <code>number</code> (Group ID), inte en sträng.</p>
                        <p>• <strong>Comparison:</strong> Vi använder <code>&lt;</code> och <code>&gt;</code> för att sortera historik vs framtid. ID:t måste vara sekventiellt ökande (1, 2, 3...).</p>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default CodeArchaeology;
