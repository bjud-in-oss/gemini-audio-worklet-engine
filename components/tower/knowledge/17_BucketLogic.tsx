
import React from 'react';

const BucketLogic: React.FC = () => {
    return (
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-200">
            <h3 className="text-violet-400 font-bold text-sm uppercase tracking-widest mb-3 border-b border-violet-500/30 pb-1 flex items-center gap-2">
                17. Grafikmotor: Hink-Logiken (Bucket Logic)
            </h3>

            <div className="bg-slate-900/80 p-5 rounded-xl border border-violet-500/20 text-slate-300 text-sm space-y-6">
                
                <p className="text-sm text-slate-400 leading-relaxed">
                    Hur vet datorn vilket ord som ska lysa och hur länge? Vi kan inte dela tiden rättvist, för ordet "i" går fortare att säga än "institutionalisera".
                </p>

                {/* THE BUCKET ANALOGY */}
                <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-3">
                    <strong className="text-violet-300 text-xs uppercase block">Liknelse: Vattenhinkar</strong>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Föreställ dig att varje ord är en hink.
                        <br/>1. Ett kort ord (t.ex. "Hej") är en liten kopp.
                        <br/>2. Ett långt ord (t.ex. "Välkommen") är en stor balja.
                        <br/>3. Ett kommatecken är en extra skvätt volym (paus).
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Tiden är vattnet som rinner. Vi häller vattnet i hinkarna i tur och ordning. När vattnet rinner ner i "Välkommen-baljan", lyser det ordet på skärmen. Eftersom baljan är stor, lyser ordet längre.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-950/50 p-3 rounded border border-slate-800">
                        <strong className="text-white text-xs block mb-1">Matematiken (Viktning)</strong>
                        <code className="text-[10px] text-green-400 font-mono block mb-1">
                            Vikt = Antal Bokstäver
                        </code>
                        <ul className="text-[10px] text-slate-500 list-disc list-inside">
                            <li>Punkt (.) ger +15 vikt (Lång paus)</li>
                            <li>Komma (,) ger +6 vikt (Kort paus)</li>
                        </ul>
                    </div>
                    <div className="bg-slate-950/50 p-3 rounded border border-slate-800">
                        <strong className="text-white text-xs block mb-1">Resultatet</strong>
                        <p className="text-[10px] text-slate-400">
                            Karaoke-effekten känns "mänsklig" eftersom den saktar ner vid långa ord och stannar upp vid punkter, precis som en riktig talare.
                        </p>
                    </div>
                </div>

                {/* DEV SPECS */}
                <div className="mt-4 pt-4 border-t border-slate-800">
                    <strong className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-2">Technical Implementation Specs</strong>
                    <div className="bg-black/30 p-2 rounded text-[10px] font-mono text-slate-400 space-y-1">
                        <p>• <strong>Punctuation Weight:</strong> <code>. ! ?</code> = +15 chars. <code>,</code> = +6 chars.</p>
                        <p>• <strong>Calculation:</strong> <code>wordDuration = (wordWeight / totalWeight) * totalTime</code></p>
                        <p>• <strong>File:</strong> <code>hooks/useKaraokeAnimation.ts</code></p>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default BucketLogic;
