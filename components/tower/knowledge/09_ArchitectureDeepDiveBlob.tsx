
import React from 'react';

const ArchitectureDeepDiveBlob: React.FC = () => {
    return (
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-800">
            <h3 className="text-teal-400 font-bold text-sm uppercase tracking-widest mb-3 border-b border-teal-500/30 pb-1 flex items-center gap-2">
                9. Arkitektur: Blob Injection & Stabilitet (Långa Sessioner)
            </h3>

            <div className="bg-slate-900/80 p-5 rounded-xl border border-teal-500/20 text-slate-300 text-sm space-y-6">
                
                {/* 1. THE PROBLEM */}
                <div>
                    <h4 className="text-white font-bold mb-2 flex items-center gap-2 text-sm">
                        <span className="bg-red-500/20 text-red-300 px-2 py-0.5 rounded text-xs">PROBLEM</span>
                        "Invalid URL" & Byggsystemets Fälla
                    </h4>
                    <p className="text-sm text-slate-400 leading-relaxed">
                        Moderna byggverktyg (Vite/Webpack) har svårt att hantera sökvägar till Web Workers i produktion. 
                        Fel som <code>Failed to construct 'URL': Invalid URL</code> uppstår ofta när appen försöker ladda <code>vad.worker.ts</code> via <code>import.meta.url</code>. 
                        Detta dödar ljudmotorn helt.
                    </p>
                </div>

                {/* 2. THE SOLUTION */}
                <div>
                    <h4 className="text-white font-bold mb-2 flex items-center gap-2 text-sm">
                        <span className="bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded text-xs">LÖSNING</span>
                        Strategi: Manual Blob Injection
                    </h4>
                    <div className="bg-slate-950 p-4 rounded border border-slate-800 font-mono text-xs space-y-2">
                        <p className="text-slate-500">// Istället för att ladda en extern fil, bäddar vi in koden som en sträng:</p>
                        <div className="text-blue-300">const WORKER_CODE = `... all källkod här ...`;</div>
                        <div className="text-purple-300">const blob = new Blob([WORKER_CODE], &#123; type: 'application/javascript' &#125;);</div>
                        <div className="text-yellow-300">const blobUrl = URL.createObjectURL(blob);</div>
                        <div className="text-green-300">const worker = new Worker(blobUrl);</div>
                    </div>
                    <p className="mt-3 text-sm text-slate-400">
                        <strong>Resultat:</strong> 100% immunitet mot sökvägsfel. Workern existerar virtuellt i minnet och kräver ingen nätverksförfrågan för att laddas.
                    </p>
                </div>

                {/* 3. STABILITY PACKAGE */}
                <div>
                    <h4 className="text-white font-bold mb-2 border-b border-slate-800 pb-1 text-sm">
                        Stabilitetspaket: För Sessioner > 20 min
                    </h4>
                    <ul className="space-y-2 text-sm text-slate-400 list-disc list-inside">
                        <li>
                            <strong className="text-teal-400">Blob-Sanering:</strong> Vi kör <code>URL.revokeObjectURL(blobUrl)</code> vid unmount. Annars fylls RAM-minnet med kopior av koden vid varje omstart.
                        </li>
                        <li>
                            <strong className="text-teal-400">Brutal Terminering:</strong> VAD-modellen (ONNX/WASM) ligger utanför JS Garbage Collector. Vi måste köra <code>worker.terminate()</code> för att tvinga webbläsaren att döda tråden.
                        </li>
                        <li>
                            <strong className="text-teal-400">AudioContext Hard Close:</strong> Webbläsare tillåter max 6 ljudmotorer. Vi anropar <code>.close()</code> (inte bara suspend) för att släppa hårdvarulåset.
                        </li>
                        <li>
                            <strong className="text-teal-400">Zombie-skydd:</strong> Innan en ny anslutning görs, verifierar vi att den gamla WebSocketen är stängd.
                        </li>
                    </ul>
                </div>

            </div>
        </section>
    );
};

export default ArchitectureDeepDiveBlob;
