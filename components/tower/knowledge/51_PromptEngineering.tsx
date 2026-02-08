
import React from 'react';

const PromptEngineering: React.FC = () => {
    return (
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-600">
            <h3 className="text-pink-400 font-bold text-sm uppercase tracking-widest mb-3 border-b border-pink-500/30 pb-1 flex items-center gap-2">
                <span className="bg-pink-900/30 text-pink-300 px-2 rounded text-xs border border-pink-500/30">MODUL 51</span>
                Arkitektur: Prompt Engineering & Språkval
            </h3>

            <div className="bg-slate-900/80 p-5 rounded-xl border border-pink-500/20 text-slate-300 text-sm space-y-8">
                
                <p className="text-sm text-slate-400 leading-relaxed italic">
                    Hur vet AI:n vad den ska göra? Det börjar med användarens klick och slutar med en strängtext till Google.
                </p>

                {/* FLOW CHART */}
                <div className="flex items-center gap-2 text-[10px] font-mono overflow-x-auto pb-4 pt-2">
                    <div className="bg-slate-950 p-3 rounded border border-slate-700 min-w-[100px]">
                        <strong className="text-blue-400 block mb-1">UI (Val)</strong>
                        <span className="text-slate-500">Svenska / Engelska</span>
                    </div>
                    <span className="text-slate-600">→</span>
                    <div className="bg-slate-950 p-3 rounded border border-slate-700 min-w-[100px]">
                        <strong className="text-purple-400 block mb-1">Builder</strong>
                        <span className="text-slate-500">Injects Variables</span>
                    </div>
                    <span className="text-slate-600">→</span>
                    <div className="bg-slate-950 p-3 rounded border border-slate-700 min-w-[100px]">
                        <strong className="text-pink-400 block mb-1">System Prompt</strong>
                        <span className="text-slate-500">Final Instruction</span>
                    </div>
                </div>

                {/* 1. LANGUAGE SELECTOR */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <h4 className="text-white font-bold text-xs uppercase tracking-widest border-l-4 border-blue-500 pl-3">1. Språkväljaren (State)</h4>
                    <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2">
                        <strong className="text-blue-300 text-xs block">Dual Mode & Historik</strong>
                        <p className="text-xs text-slate-400">
                            Komponenten <code>LanguageSelectorModal</code> hanterar val av språk.
                            <br/>• Den sparar de 7 senaste språken i <code>localStorage</code>.
                            <br/>• Den skickar en array <code>['Svenska', 'Engelska']</code> till huvudkonfigurationen.
                        </p>
                    </div>
                </div>

                {/* 2. PROMPT BUILDER */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <h4 className="text-white font-bold text-xs uppercase tracking-widest border-l-4 border-purple-500 pl-3">2. Prompt Builder (The Factory)</h4>
                    <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-3">
                        <strong className="text-purple-300 text-xs block">Dynamisk Injektion</strong>
                        <p className="text-xs text-slate-400">
                            Filen <code>utils/promptBuilder.ts</code> är hjärtat i textgenereringen. Den tar en mall (t.ex. "Standard Bandspelare") och gör sök-och-ersätt.
                        </p>
                        <div className="bg-black/40 p-2 rounded font-mono text-[10px] text-slate-400 border border-white/10">
                            <span className="text-slate-600">// Template:</span> "Translate {'{{L1}}'} to {'{{L2}}'}"<br/>
                            <span className="text-slate-600">// Input:</span> L1="Svenska", L2="Finska"<br/>
                            <span className="text-green-400">// Result:</span> "Translate Svenska to Finska"
                        </div>
                    </div>
                </div>

                {/* 3. SYSTEM PROMPT */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <h4 className="text-white font-bold text-xs uppercase tracking-widest border-l-4 border-pink-500 pl-3">3. System Prompt (The Law)</h4>
                    <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2">
                        <p className="text-xs text-slate-400">
                            Detta är den slutgiltiga strängen som skickas till <code>ai.live.connect()</code>. Den definierar AI:ns "Själ".
                        </p>
                        <ul className="list-disc list-inside text-xs text-slate-400 space-y-1 mt-2">
                            <li><strong>Identitet:</strong> "Simultaneous Interpreter"</li>
                            <li><strong>Mode:</strong> "Tape Recorder Protocol" (Dvs, var dum och snabb).</li>
                            <li><strong>Regler:</strong> "NEVER BACKTRACK", "IGNORE GRAMMAR".</li>
                        </ul>
                        <p className="text-[10px] text-pink-300 italic mt-2">
                            Detta är statiskt under en session. Om du byter språk eller mall måste anslutningen startas om (vilket appen gör automatiskt).
                        </p>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default PromptEngineering;
