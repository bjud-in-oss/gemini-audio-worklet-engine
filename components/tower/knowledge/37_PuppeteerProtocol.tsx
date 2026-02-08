
import React from 'react';

const PuppeteerProtocol: React.FC = () => {
    return (
        <section className="mb-12 border-t border-fuchsia-500/30 pt-8">
            <h3 className="text-fuchsia-400 font-bold text-sm uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="bg-fuchsia-900/30 text-fuchsia-300 px-2 rounded text-xs border border-fuchsia-500/30">MODUL 37</span>
                Puppeteer Protocol: Regissören
            </h3>

            <div className="bg-slate-900/80 p-5 rounded-xl border border-fuchsia-500/20 text-slate-300 text-sm space-y-8">
                
                {/* 1. CONCEPT */}
                <div className="space-y-4">
                    <h4 className="text-white font-bold text-xs uppercase tracking-widest border-l-4 border-fuchsia-500 pl-3">Konceptet: Osynlig Styrning</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        När en talare tar en lång paus (t.ex. för att läsa i en bok eller tänka), riskerar AI:n att tro att meningen är slut och "hallucinera" fram ett eget slut.
                        <br/><br/>
                        <strong>Lösningen:</strong> Appen agerar "Regissör" (Puppeteer). Vid tystnad skickar vi osynliga textkommandon (User Turns) till AI:n. Dessa syns inte för användaren, men tvingar AI:n att hålla sig aktiv utan att avsluta meningen.
                    </p>
                </div>

                {/* 2. THE TIMELINE */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <h4 className="text-white font-bold text-xs uppercase tracking-widest border-l-4 border-purple-500 pl-3">Tidslinjen (Systemparametrar)</h4>
                    
                    <div className="space-y-3 bg-slate-950 p-4 rounded border border-slate-800">
                        {/* STAGE 1 */}
                        <div className="flex gap-3 relative items-start">
                            <div className="w-12 text-right font-mono text-xs text-blue-400 pt-1 font-bold">1.5s</div>
                            <div className="w-0.5 bg-slate-700 self-stretch relative mx-2">
                                <div className="absolute top-2 -left-1 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                            </div>
                            <div className="flex-1 pb-4">
                                <div className="flex justify-between items-center mb-1">
                                    <strong className="text-blue-300 text-xs">STEG 1: REPEAT</strong>
                                    <code className="text-[9px] bg-blue-900/30 px-1 rounded text-blue-200 border border-blue-500/30">[CMD: REPEAT_LAST]</code>
                                </div>
                                <p className="text-[10px] text-slate-400">
                                    Om tystnaden varar 1.5 sekunder, ber vi AI:n upprepa sitt <em>sista ord</em> med en tvekande ton. Detta köper tid och signalerar till lyssnaren att "tolken tänker".
                                </p>
                            </div>
                        </div>

                        {/* STAGE 2 */}
                        <div className="flex gap-3 relative items-start">
                            <div className="w-12 text-right font-mono text-xs text-fuchsia-400 pt-1 font-bold">3.0s</div>
                            <div className="w-0.5 bg-slate-700 self-stretch relative mx-2">
                                <div className="absolute top-2 -left-1 w-2 h-2 rounded-full bg-fuchsia-500 shadow-[0_0_8px_rgba(217,70,239,0.5)]"></div>
                            </div>
                            <div className="flex-1 pb-4">
                                <div className="flex justify-between items-center mb-1">
                                    <strong className="text-fuchsia-300 text-xs">STEG 2: FILLER</strong>
                                    <code className="text-[9px] bg-fuchsia-900/30 px-1 rounded text-fuchsia-200 border border-fuchsia-500/30">[CMD: FILLER "..."]</code>
                                </div>
                                <p className="text-[10px] text-slate-400">
                                    Vid 3 sekunder injicerar vi ett utfyllnadsord (t.ex. "Låt se..." eller "Hmm...") baserat på målspråket. Detta håller ljudkanalen öppen ("Holding the floor").
                                </p>
                            </div>
                        </div>

                        {/* STAGE 3 */}
                        <div className="flex gap-3 relative items-start">
                            <div className="w-12 text-right font-mono text-xs text-red-400 pt-1 font-bold">5.0s</div>
                            <div className="w-0.5 bg-slate-700 self-stretch relative mx-2">
                                <div className="absolute top-2 -left-1 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <strong className="text-red-300 text-xs">STEG 3: HARD CUT</strong>
                                    <code className="text-[9px] text-slate-500">RESET</code>
                                </div>
                                <p className="text-[10px] text-slate-400">
                                    Om tystnaden varar i 5 sekunder ger vi upp. Vi dödar timern och tvingar fram ett avslut på turen ("Flush") för att spara resurser.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. TECHNICAL IMPLEMENTATION */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <h4 className="text-white font-bold text-xs uppercase tracking-widest border-l-4 border-green-500 pl-3">Teknisk Implementation</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-950 p-3 rounded border border-slate-800">
                            <strong className="text-green-400 text-xs block mb-1">sendTextSignal()</strong>
                            <p className="text-[10px] text-slate-500 leading-relaxed">
                                En ny funktion i <code>useGeminiSession</code> som tillåter oss att skicka:
                                <br/><code className="text-slate-300">clientContent: &#123; turns: [role: 'user'] &#125;</code>
                                <br/>utan att bryta den pågående ljudströmmen.
                            </p>
                        </div>
                        <div className="bg-slate-950 p-3 rounded border border-slate-800">
                            <strong className="text-green-400 text-xs block mb-1">Prompt Injection</strong>
                            <p className="text-[10px] text-slate-500 leading-relaxed">
                                Systemprompten har uppdaterats med sektionen <strong>PRIORITY 3: SYSTEM COMMANDS</strong>. AI:n är instruerad att lyda dessa textkommandon med absolut prioritet över ljudanalys.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default PuppeteerProtocol;
