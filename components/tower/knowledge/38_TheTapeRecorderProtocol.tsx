
import React from 'react';

const TheTapeRecorderProtocol: React.FC = () => {
    return (
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-200">
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-3 border-b border-white/20 pb-1 flex items-center gap-2">
                <span className="bg-white text-black px-2 rounded text-xs">MODUL 38</span>
                Genombrott: The Tape Recorder Protocol
            </h3>

            <div className="bg-slate-900/80 p-5 rounded-xl border border-white/10 text-slate-300 text-sm space-y-8">
                
                {/* 1. THE PARADIGM SHIFT */}
                <div className="space-y-4">
                    <h4 className="text-orange-400 font-bold text-xs uppercase tracking-widest border-l-4 border-orange-500 pl-3">Skiftet: Från "Smart" till "Linjär"</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Tidigare försökte vi vara smarta. Om ljudet klipptes, bad vi AI:n att "backa bandet" och upprepa sista ordet för att få sammanhang. Detta orsakade den ökända "Loop-buggen".
                        <br/><br/>
                        <strong>Lösningen:</strong> Vi behandlar nu AI:n som en dum bandspelare.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="bg-red-900/10 p-3 rounded border border-red-500/20 opacity-60">
                            <strong className="text-red-400 text-xs block mb-1">Gammal Logik (Loop)</strong>
                            <p className="text-[10px] text-slate-500">
                                1. Ljud klipper.<br/>
                                2. AI: "Vad sa jag nyss?"<br/>
                                3. AI upprepar kontext.<br/>
                                4. Resultat: "Och jag... och jag..."
                            </p>
                        </div>
                        <div className="bg-green-900/10 p-3 rounded border border-green-500/20">
                            <strong className="text-green-400 text-xs block mb-1">Ny Logik (Tape Recorder)</strong>
                            <p className="text-[10px] text-slate-400">
                                1. Ljud klipper.<br/>
                                2. AI: "NEVER BACKTRACK."<br/>
                                3. AI fortsätter exakt där det slutade.<br/>
                                4. Resultat: Sömlöst flöde.
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. THE GRAMMAR SACRIFICE */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <h4 className="text-blue-400 font-bold text-xs uppercase tracking-widest border-l-4 border-blue-500 pl-3">Principen: "Grammatik-offret"</h4>
                    
                    <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-3">
                        <p className="text-xs text-slate-300">
                            För att få absolut hastighet måste vi offra språklig perfektion i <em>ögonblicket</em> för att vinna flöde i <em>längden</em>.
                        </p>
                        
                        <div className="bg-black/40 p-3 rounded border border-white/5 font-mono text-xs">
                            <div className="mb-2">
                                <span className="text-slate-500">Input:</span> "Det stora röda..." <span className="text-red-500">[Klipp]</span> "...huset."
                            </div>
                            <div className="space-y-1">
                                <div className="flex gap-2">
                                    <span className="text-red-400 w-16">Fel:</span>
                                    <span className="text-slate-400">"...det stora röda huset." (Repetition)</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-green-400 w-16">Rätt:</span>
                                    <span className="text-white">"...huset." (Fragment)</span>
                                </div>
                            </div>
                        </div>
                        
                        <p className="text-[10px] text-blue-300 italic mt-2">
                            <strong>Varför?</strong> Även om "huset" ser konstigt ut som text-fragment, låter det helt naturligt för en lyssnare när det spelas upp direkt efter "Det stora röda...". Hjärnan syr ihop det.
                        </p>
                    </div>
                </div>

                {/* 3. PROMPT ARCHITECTURE */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <h4 className="text-purple-400 font-bold text-xs uppercase tracking-widest border-l-4 border-purple-500 pl-3">Den Nya Systemprompten</h4>
                    <p className="text-xs text-slate-400">
                        Vi har rensat bort all komplexitet kring "Puppeteer" och "Waiting States". Prompten är nu brutal och enkel.
                    </p>
                    <div className="bg-slate-950 p-3 rounded border border-purple-500/20 font-mono text-[10px] text-purple-200 whitespace-pre-wrap">
{`CRITICAL PROTOCOL FOR INTERRUPTIONS:
If the user interrupts you or audio cuts off, you must NEVER BACKTRACK.
DO NOT restart the sentence.
ACTION: Output the IMMEDIATE NEXT WORD from exactly where the sound cut off.
Prioritize LINEAR FLOW and SPEED over correctness.`}
                    </div>
                </div>

            </div>
        </section>
    );
};

export default TheTapeRecorderProtocol;
