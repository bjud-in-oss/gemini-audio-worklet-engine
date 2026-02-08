
import React from 'react';

const VisualDebuggingFix: React.FC = () => {
    return (
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-300">
            <h3 className="text-blue-400 font-bold text-sm uppercase tracking-widest mb-3 border-b border-blue-500/30 pb-1 flex items-center gap-2">
                <span className="bg-blue-900/30 text-blue-300 px-2 rounded text-xs border border-blue-500/30">MODUL 41</span>
                Diagnos: Visuell Integritet (TX Blinking)
            </h3>

            <div className="bg-slate-900/80 p-5 rounded-xl border border-blue-500/20 text-slate-300 text-sm space-y-8">
                
                {/* 1. THE PROBLEM */}
                <div className="space-y-4">
                    <h4 className="text-white font-bold text-xs uppercase tracking-widest border-l-4 border-blue-500 pl-3">Problemet: Falska Signaler</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Under felsökningen av Skölden såg vi att <strong>TX-lampan</strong> (Transmit) blinkade blått trots att Skölden var Röd (Låst).
                        Detta lurade oss att tro att nätverket läckte, när det egentligen bara var instrumentpanelen som var felkopplad.
                    </p>
                    
                    <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2">
                        <strong className="text-blue-300 text-xs block">Varför det blinkade:</strong>
                        <p className="text-[10px] text-slate-500 font-mono">
                            handleStreamingAudio() &#123;<br/>
                            &nbsp;&nbsp;<span className="text-red-400">triggerVisualTX(); // &lt;-- Låg före if-satsen</span><br/>
                            &nbsp;&nbsp;if (shieldActive) buffer();<br/>
                            &nbsp;&nbsp;else send();<br/>
                            &#125;
                        </p>
                        <p className="text-xs text-slate-400">
                            Koden blinkade "Sänder" varje gång <em>mikrofonen</em> levererade ljud, inte när <em>nätverket</em> tog emot det.
                        </p>
                    </div>
                </div>

                {/* 2. THE FIX */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <h4 className="text-white font-bold text-xs uppercase tracking-widest border-l-4 border-green-500 pl-3">Lösningen: Flytta Mätpunkten</h4>
                    
                    <div className="bg-green-900/10 p-4 rounded border border-green-500/20 space-y-3">
                        <p className="text-xs text-slate-300">
                            Vi flyttade den visuella triggern <strong>in i else-satsen</strong>, precis innan <code>sendAudio()</code>.
                        </p>
                        <div className="bg-slate-900 p-2 rounded border border-green-500/50">
                            <code className="text-[9px] text-slate-500 block font-mono">
                                if (shieldActive) buffer();<br/>
                                else &#123;<br/>
                                &nbsp;&nbsp;<span className="text-green-400">triggerVisualTX(); // &lt;-- Nu visar den sanningen</span><br/>
                                &nbsp;&nbsp;send();<br/>
                                &#125;
                            </code>
                        </div>
                    </div>
                </div>

                {/* 3. PHILOSOPHY */}
                <div className="mt-4 p-3 bg-blue-900/20 rounded border border-blue-500/30 flex items-start gap-3">
                    <div className="text-xl mt-1">👁️</div>
                    <div>
                        <strong className="text-blue-300 text-xs block mb-1">Princip: "Lita på Instrumenten"</strong>
                        <p className="text-[10px] text-slate-300 leading-relaxed">
                            Om diagnosverktygen visar input (Mic) istället för output (Net), kan vi aldrig hitta logiska fel. 
                            En blinkande lampa i Tower måste betyda att en <code>WebSocket.send()</code> faktiskt har skett.
                        </p>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default VisualDebuggingFix;
