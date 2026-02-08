
import React from 'react';

const AudioMixingScenarios: React.FC = () => {
    return (
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-700">
            <h3 className="text-amber-400 font-bold text-sm uppercase tracking-widest mb-3 border-b border-amber-500/30 pb-1 flex items-center gap-2">
                29. Ljudmixning: The Pro Split (Stereo) & AEC
            </h3>

            <div className="bg-slate-900/80 p-5 rounded-xl border border-amber-500/20 text-slate-300 text-sm space-y-8">
                
                {/* 1. THE PROBLEM: AI FEEDBACK LOOP */}
                <div className="space-y-4">
                    <h4 className="text-white font-bold text-xs uppercase tracking-widest border-l-4 border-red-500 pl-3">Problemet: AI-Rundgång</h4>
                    <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2">
                        <p className="text-xs text-slate-400 leading-relaxed">
                            <strong>Scenario:</strong> AI:n översätter → Ljudet går ut i kyrkans högtalare → Mikrofonen hör högtalarna → AI:n hör sig själv → AI:n översätter sin egen översättning (Loop).
                        </p>
                        <div className="flex gap-2 text-[10px] font-mono mt-2">
                            <div className="bg-red-900/20 p-1.5 rounded border border-red-500/30 text-red-300 flex-1 text-center">
                                Mjukvaru-AEC (Webb)
                                <br/><span className="text-slate-500">Ofta för svag för kyrkorum.</span>
                            </div>
                            <div className="bg-green-900/20 p-1.5 rounded border border-green-500/30 text-green-300 flex-1 text-center">
                                Hårdvaru-AEC (Tesira)
                                <br/><span className="text-slate-500">Korrekt lösning.</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. THE TESIRA FIX */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <h4 className="text-white font-bold text-xs uppercase tracking-widest border-l-4 border-green-500 pl-3">Lösningen: Tesira AEC Reference</h4>
                    
                    <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-4">
                        <p className="text-xs text-slate-400">
                            För att Tesiran ska kunna "radera" AI-rösten från mikrofonen måste den veta exakt vad den ska leta efter.
                        </p>

                        <div className="relative bg-black/40 p-4 rounded-lg border border-white/10 font-mono text-xs">
                            <div className="absolute top-2 right-2 text-[9px] text-slate-500">Tesira Logic View</div>
                            
                            {/* DIAGRAM */}
                            <div className="space-y-4">
                                {/* RAD 1: USB IN */}
                                <div className="flex items-center gap-2">
                                    <div className="bg-blue-900/30 text-blue-400 p-2 rounded border border-blue-500/30 w-24 text-center">
                                        USB Input
                                        <div className="text-[8px] text-slate-400">(AI Ljud)</div>
                                    </div>
                                    <div className="h-0.5 w-8 bg-blue-500/50"></div>
                                    <div className="text-[9px] text-slate-500 w-20 text-center">---&gt;</div>
                                    <div className="bg-slate-800 text-white p-2 rounded w-24 text-center">Högtalare</div>
                                </div>

                                {/* THE CRITICAL CONNECTION */}
                                <div className="absolute left-[120px] top-[30px] w-0.5 h-12 bg-yellow-500/50"></div>
                                <div className="absolute left-[120px] top-[75px] w-4 h-0.5 bg-yellow-500/50"></div>

                                {/* RAD 2: MIC IN */}
                                <div className="flex items-center gap-2 mt-6">
                                    <div className="bg-slate-800 text-white p-2 rounded w-24 text-center">
                                        Mikrofon
                                    </div>
                                    <div className="h-0.5 w-4 bg-slate-600"></div>
                                    <div className="bg-green-900/30 text-green-400 p-2 rounded border border-green-500/30 w-32 relative">
                                        AEC Input
                                        {/* REF PIN */}
                                        <div className="absolute -top-3 left-4 text-[8px] text-yellow-400 font-bold">REF</div>
                                        <div className="absolute -top-1 left-5 w-2 h-2 bg-yellow-500 rounded-full"></div>
                                    </div>
                                    <div className="h-0.5 w-4 bg-green-500/50"></div>
                                    <div className="bg-blue-900/30 text-blue-400 p-2 rounded border border-blue-500/30 w-24 text-center">
                                        USB Output
                                        <div className="text-[8px] text-slate-400">(Till App)</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <p className="text-[10px] text-yellow-300 italic mt-2">
                            <strong>Nyckeln:</strong> Du måste dra en sladd (virtuell) från <em>USB Input</em> (AI-ljudet) till <em>AEC Reference</em>-pinnen på mikrofon-blocket. Då vet Tesiran: "Detta ljud kommer ur högtalarna, ta bort det från mikrofonen."
                        </p>
                    </div>
                </div>

                {/* 3. MULTI-CHANNEL STRATEGY */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <h4 className="text-white font-bold text-xs uppercase tracking-widest border-l-4 border-purple-500 pl-3">Fler Kanaler? (Stereo Split)</h4>
                    <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2">
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Webbläsare har svårt att hantera 3-4 ljudkort samtidigt. 
                            Det bästa sättet att separera t.ex. "AI-ljud" från "Zoom-ljud" in i Tesiran är att använda <strong>Stereo-panorering</strong>.
                        </p>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="bg-purple-900/10 p-2 rounded border border-purple-500/20 text-center">
                                <strong className="text-purple-400 text-xs block">Vänster Kanal (L)</strong>
                                <span className="text-[10px] text-slate-400">AI Översättning</span>
                            </div>
                            <div className="bg-blue-900/10 p-2 rounded border border-blue-500/20 text-center">
                                <strong className="text-blue-400 text-xs block">Höger Kanal (R)</strong>
                                <span className="text-[10px] text-slate-400">Zoom / Annat</span>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                            I Tesiran tar du emot USB (2-ch). Du splitar upp signalen. 
                            <br/>Vänster → Högtalare + AEC Ref. 
                            <br/>Höger → Zoom Mix.
                        </p>
                    </div>
                </div>

                {/* 4. ADVANCED: 4X4 USB CONFIG */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <h4 className="text-white font-bold text-xs uppercase tracking-widest border-l-4 border-cyan-500 pl-3">Avancerat: 4x4 Tesira Matrix</h4>
                    
                    <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-3">
                        <p className="text-xs text-slate-400">
                            <strong>Fråga:</strong> "Vi använder 4 kanaler USB (4in/4out). Fungerar appen då?"
                            <br/>
                            <strong>Svar:</strong> Ja, men webbläsaren lyssnar normalt bara på Kanal 1 & 2. Du måste mappa ljudet rätt i Tesiran.
                        </p>

                        <div className="overflow-x-auto border border-slate-700 rounded bg-black/40 mt-2">
                            <table className="w-full text-[10px] font-mono text-left">
                                <thead className="bg-slate-900 text-slate-500 border-b border-slate-700">
                                    <tr>
                                        <th className="p-2 border-r border-slate-700">Tesira USB UT</th>
                                        <th className="p-2 border-r border-slate-700">Innehåll</th>
                                        <th className="p-2 text-cyan-400">Appens Öra</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-300">
                                    <tr className="border-b border-slate-800/50 bg-cyan-900/10">
                                        <td className="p-2 border-r border-slate-700 font-bold">Kanal 1</td>
                                        <td className="p-2 border-r border-slate-700">Talare (Preacher)</td>
                                        <td className="p-2 font-bold text-cyan-300">PRIMÄR INPUT</td>
                                    </tr>
                                    <tr className="border-b border-slate-800/50">
                                        <td className="p-2 border-r border-slate-700 text-slate-500">Kanal 2</td>
                                        <td className="p-2 border-r border-slate-700 text-slate-500">Reserv / Zoom</td>
                                        <td className="p-2 text-slate-600">Ignoreras (oftast)</td>
                                    </tr>
                                    <tr className="border-b border-slate-800/50">
                                        <td className="p-2 border-r border-slate-700 text-slate-500">Kanal 3</td>
                                        <td className="p-2 border-r border-slate-700 text-slate-500">Inspelning / Kör</td>
                                        <td className="p-2 text-slate-600">Ignoreras</td>
                                    </tr>
                                    <tr>
                                        <td className="p-2 border-r border-slate-700 text-slate-500">Kanal 4</td>
                                        <td className="p-2 border-r border-slate-700 text-slate-500">Orgel</td>
                                        <td className="p-2 text-slate-600">Ignoreras</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="text-[10px] text-cyan-300 italic">
                            <strong>Konfiguration:</strong> I Biamp Canvas, koppla "Talarmikrofonen" till <strong>Pin 1</strong> på USB-utgångsblocket. Det säkerställer att appen hör rätt sak.
                        </p>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default AudioMixingScenarios;
